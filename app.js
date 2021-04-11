import { app, errorHandler, sparqlEscapeDateTime } from 'mu';
import { AUTO_RUN, BACKEND_URL, MASTER_GRAPH, MU_AUTH_ALLOWED_GROUPS } from './config';
import { querySudo as query } from '@lblod/mu-auth-sudo';
import fetch from 'node-fetch';

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
  const mostRecentAgendaIds = await fetchMostRecentAgendas();
  console.log(`Found ${mostRecentAgendaIds.length} agendas that have been modified last year`);

  for (let group of MU_AUTH_ALLOWED_GROUPS) {
    const allowedGroupHeader = JSON.stringify(group);
    console.log(`Warming up cache for allowed group ${allowedGroupHeader}`);

    let i = 0;
    for (let agenda of mostRecentAgendaIds) {
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

async function fetchMostRecentAgendas() {
  const since = new Date();
  since.setYear(since.getFullYear() - 1); // 1 year ago
  const queryResult = await query(`
    PREFIX besluitvorming: <http://data.vlaanderen.be/ns/besluitvorming#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    SELECT DISTINCT ?agendaId WHERE {
      GRAPH <${MASTER_GRAPH}> {
        ?s a besluitvorming:Agenda ;
           mu:uuid ?agendaId ;
           dct:modified ?modified .
      }
      FILTER (?modified > ${sparqlEscapeDateTime(since)})
    } ORDER BY DESC(?modified)
  `);

  return queryResult.results.bindings.map(b => b['agendaId'].value);
}

function getAgendaitemsRequestUrl(agendaId) {
  const path = 'agendaitems';
  const params = new URLSearchParams({
    'fields[document-containers]': '',
    'fields[mandatees]': 'title,priority',
    'fields[pieces]': 'name,document-container,created',
    'filter[agenda][:id:]': agendaId,
    'include': 'mandatees,pieces,pieces.document-container',
    'page[size]': 300,
    'sort': 'show-as-remark,priority'
  });
  return `${BACKEND_URL}${path}?${params}`;
}

app.use(errorHandler);
