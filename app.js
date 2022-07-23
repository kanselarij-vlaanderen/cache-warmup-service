import { app, errorHandler } from "mu";
import fetch from "node-fetch";
import {
  AUTO_RUN,
  BACKEND_URL,
  ENABLE_RECENT_AGENDAS_CACHE,
  ENABLE_LARGE_AGENDAS_CACHE,
  MIN_NB_OF_AGENDAITEMS,
  MU_AUTH_ALLOWED_GROUPS,
  REQUEST_CHUNK_SIZE,
} from "./config";
import * as helpers from "./helpers";

app.get("/", function (req, res) {
  res.send("Are you cold? Let's warm this place up.");
});

app.post("/warmup", function (req, res) {
  warmup();
  res.status(202).send();
});

if (AUTO_RUN) warmup();

async function warmup() {
  let cachedAgendaIds = [];
  if (ENABLE_RECENT_AGENDAS_CACHE) {
    const recentAgendaIds = await helpers.fetchMostRecentAgendas();
    console.log(
      `Found ${recentAgendaIds.length} agendas that have been modified last year`
    );
    await warmupAgendas(recentAgendaIds);
    cachedAgendaIds = recentAgendaIds;
  } else {
    console.log(
      `Caching of recent agendas disabled. Set ENABLE_RECENT_AGENDAS_CACHE env var on "true" to enable.`
    );
  }

  if (ENABLE_LARGE_AGENDAS_CACHE) {
    let largeAgendaIds = await helpers.fetchLargeAgendas();
    console.log(
      `Found ${largeAgendaIds.length} agendas that have more than ${MIN_NB_OF_AGENDAITEMS} agendaitems`
    );
    if (cachedAgendaIds.length) {
      let filteredAgendaIds = largeAgendaIds.filter(
        (agendaId) => !cachedAgendaIds.includes(agendaId)
      );
      console.log(
        `Of those ${largeAgendaIds.length} agendas, ${filteredAgendaIds.length} agendas have not yet been cached.`
      );
      largeAgendaIds = filteredAgendaIds;
    }
    await warmupAgendas(largeAgendaIds);
  } else {
    console.log(
      `Caching of large agendas disabled. Set ENABLE_LARGE_AGENDAS_CACHE env var on "true" to enable.`
    );
  }
}

async function warmupAgendas(agendas) {
  let i = 0;
  for (let agenda of agendas) {
    console.log(`Warming up cache for all allowed groups for agenda ${agenda}`);

    for (let group of MU_AUTH_ALLOWED_GROUPS) {
      const allowedGroupHeader = JSON.stringify(group);
      await warmupAgenda(agenda, allowedGroupHeader);
    }

    i++;
    if (i % 10 == 0) console.log(`Loaded ${i} agendas in cache`);
  }
}

async function warmupAgenda(agenda, allowedGroupHeader) {
  try {
    const urls = await getAgendaitemsRequestUrls(agenda);
    const chunkedUrls = helpers.chunk(urls, REQUEST_CHUNK_SIZE);
    console.log(
      `Warming up agenda ${agenda} requires ${urls.length} requests which will be made in parallel in batches of ${REQUEST_CHUNK_SIZE}`
    );
    for (const chunk of chunkedUrls) {
      const promises = chunk.map((url) => {
        return fetch(url, {
          method: "GET",
          headers: {
            "mu-auth-allowed-groups": allowedGroupHeader,
          }
        });
      });
      await Promise.all(promises);
    }
  } catch (error) {
    console.warn(`error warming up agenda ${agenda}, not retrying`);
    console.error(error.message);
  }
}

async function getAgendaitemsRequestUrls(agendaId) {
  const agendaitemIds = await helpers.fetchAgendaitemsFromAgenda(agendaId);
  const urls = [];
  // agendaitems of the agenda
  const path = "agendaitems";
  const params = new URLSearchParams({
    "filter[agenda][:id:]": agendaId,
    "page[size]": 300,
    sort: "show-as-remark,number",
  });
  urls.push(`${BACKEND_URL}${path}?${params}`);

  // agendaitem mandatees
  for (let agendaitemId of agendaitemIds) {
    const path = `agendaitems/${agendaitemId}`;
    const params = new URLSearchParams({
      include: "mandatees",
    });
    urls.push(`${BACKEND_URL}${path}?${params}`);
  }

  // agendaitem pieces
  for (let agendaitemId of agendaitemIds) {
    const path = "pieces";
    const params = new URLSearchParams({
      "filter[agendaitems][:id:]": agendaitemId,
      include: "document-container,access-level",
      "page[size]": 500,
    });
    urls.push(`${BACKEND_URL}${path}?${params}`);
  }

  return urls;
}

app.use(errorHandler);
