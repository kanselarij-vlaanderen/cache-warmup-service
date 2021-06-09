import { app, errorHandler } from 'mu';
import fetch from 'node-fetch';
import { AUTO_RUN, BACKEND_URL,
         ENABLE_RECENT_AGENDAS_CACHE, ENABLE_LARGE_AGENDAS_CACHE,
         MIN_NB_OF_AGENDAITEMS, MU_AUTH_ALLOWED_GROUPS } from './config';
import { fetchMostRecentAgendas, fetchLargeAgendas } from './helpers';

app.get('/', function(req, res) {
  res.send("Are you cold? Let's warm this place up.");
});

app.post('/warmup', function(req, res) {
  warmup();
  res.status(202).send();
});

if (AUTO_RUN)
  warmup();

async function warmup() {
  if (ENABLE_RECENT_AGENDAS_CACHE) {
    const agendaIds = await fetchMostRecentAgendas();
    console.log(`Found ${agendaIds.length} agendas that have been modified last year`);
    await warmupAgendas(agendaIds);
  } else {
    console.log(`Caching of recent agendas disabled. Set ENABLE_RECENT_AGENDAS_CACHE env var on "true" to enable.`);
  }

  if (ENABLE_LARGE_AGENDAS_CACHE) {
    const agendaIds = await fetchLargeAgendas();
    console.log(`Found ${agendaIds.length} agendas that have more than ${MIN_NB_OF_AGENDAITEMS} agendaitems`);
    await warmupAgendas(agendaIds);
  } else {
    console.log(`Caching of large agendas disabled. Set ENABLE_LARGE_AGENDAS_CACHE env var on "true" to enable.`);
  }
}

async function warmupAgendas(agendas) {
  for (let group of MU_AUTH_ALLOWED_GROUPS) {
    const allowedGroupHeader = JSON.stringify(group);
    console.log(`Warming up cache for allowed group ${allowedGroupHeader}`);

    let i = 0;
    for (let agenda of agendas) {
      i++;
      await warmupAgenda(agenda, allowedGroupHeader);
      if (i % 10 == 0)
        console.log(`Loaded ${i} agendas in cache`);
    }
    console.log(`Finished warming up cache for allowed group ${allowedGroupHeader}`);
  }
}

async function warmupAgenda(agenda, allowedGroupHeader) {
  const url = getAgendaitemsRequestUrl(agenda);
  await fetch(url, {
    method: 'GET',
    headers: {
      'mu-auth-allowed-groups': allowedGroupHeader
    }
  });
}

function getAgendaitemsRequestUrl(agendaId) {
  const path = 'agendaitems';
  const params = new URLSearchParams({
    'fields[document-containers]': '',
    'fields[mandatees]': 'title,priority',
    'fields[pieces]': 'name,document-container,created,confidential',
    'filter[agenda][:id:]': agendaId,
    'include': 'mandatees,pieces,pieces.document-container',
    'page[size]': 300,
    'sort': 'show-as-remark,priority'
  });
  return `${BACKEND_URL}${path}?${params}`;
}

app.use(errorHandler);
