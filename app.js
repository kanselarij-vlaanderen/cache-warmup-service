import { app, errorHandler } from "mu";
import fetch from "node-fetch";
import {
  AUTO_RUN,
  BACKEND_URL,
  ENABLE_RECENT_AGENDAS_CACHE,
  ENABLE_LARGE_AGENDAS_CACHE,
  ENABLE_CONCEPTS_CACHE,
  MIN_NB_OF_AGENDAITEMS,
  MU_AUTH_ALLOWED_GROUPS,
  REQUEST_CHUNK_SIZE,
  CONCEPT_SCHEMES,
  STATIC_TYPES,
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
  if (ENABLE_CONCEPTS_CACHE) {
    await warmupConcepts();
  } else {
    console.log(
      `Caching of concepts disabled. set ENABLE_CONCEPTS_CACHE env var on "true" to enable.`
    );
  }

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

  console.log(`Cache warmup finished`);
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
    if (i % 10 == 0) console.log(`Loaded ${i} agendas in cache for all allowed groups`);
  }
}

async function warmupAgenda(agenda, allowedGroupHeader) {
  try {
    const urls = await getAgendaitemsRequestUrls(agenda);
    const chunkedUrls = helpers.chunk(urls, REQUEST_CHUNK_SIZE);
    console.log(
      `Warming up agenda ${agenda} for allowed group ${allowedGroupHeader} (${urls.length} requests, executed in parallel per ${REQUEST_CHUNK_SIZE})`
    );
    let i = 1;
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
      console.log(`-- Batch ${i}/${chunkedUrls.length} done`);
      i++;
    }
  } catch (error) {
    console.warn(`Error warming up agenda ${agenda} for allowed group ${allowedGroupHeader}. Not going to retry.`);
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
    include: "type",
    "page[size]": 300,
    sort: "type,number",
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
      include: "access-level,document-container",
      "page[size]": 500,
    });
    urls.push(`${BACKEND_URL}${path}?${params}`);
  }

  return urls;
}

async function warmupConcepts() {
  const urls = [
    getAgendaitemTypeConceptRequest(),
    ...[
      CONCEPT_SCHEMES.MEETING_TYPE,
      CONCEPT_SCHEMES.ACCESS_LEVELS,
      CONCEPT_SCHEMES.DOCUMENT_TYPES,
      CONCEPT_SCHEMES.DECISION_RESULT_CODES,
      CONCEPT_SCHEMES.RELEASE_STATUSES,
      CONCEPT_SCHEMES.USER_ROLES,
    ].map(getConceptRequestUrl),
    ...(await getConceptsBatchedRequestsUrls(CONCEPT_SCHEMES.GOVERNMENT_FIELDS)),
    ...STATIC_TYPES.map(getStaticTypeUrl),
  ];

  for (let group of MU_AUTH_ALLOWED_GROUPS) {
    const allowedGroupHeader = JSON.stringify(group);
    const promises = urls.map((url) => {
      console.debug(url, allowedGroupHeader);
      return fetch(url, {
        method: "GET",
        headers: {
          "mu-auth-allowed-groups": allowedGroupHeader,
        },
      })
    });

    await Promise.all(promises);
  }
}

function getAgendaitemTypeConceptRequest() {
  const params = new URLSearchParams({
    "filter[concept-schemes][:uri:]": CONCEPT_SCHEMES.AGENDA_ITEM_TYPES,
    "page[size]": 100,
    sort: "-label",
  });
  return `${BACKEND_URL}concepts?${params}`;
}

function getConceptRequestUrl(conceptSchemeUri) {
  const params = new URLSearchParams({
    "filter[:has-no:narrower]": true,
    "filter[concept-schemes][:uri:]": conceptSchemeUri,
    include: "broader,narrower",
    "page[size]": 100,
    sort: "position",
  });
  return `${BACKEND_URL}concepts?${params}`;
}

async function getConceptsBatchedRequestsUrls(conceptSchemeUri) {
  const urls = [];

  // count
  const countParams = new URLSearchParams({
    "filter[concept-schemes][:uri:]": conceptSchemeUri,
    "page[size]": 1,
  });
  urls.push(`${BACKEND_URL}concepts?${countParams}`);

  const count = await helpers.countConceptsForConceptScheme(conceptSchemeUri);

  // the batches
  const batchSize = 100;
  const nbOfBatches = Math.ceil(count / batchSize);
  for (let i = 0; i <= nbOfBatches; i++) {
    const params = new URLSearchParams({
      "filter[concept-schemes][:uri:]": conceptSchemeUri,
      "page[size]": batchSize,
      "page[number]": i,
    });
    urls.push(`${BACKEND_URL}concepts?${params}`);
  }

  return urls;
}

function getStaticTypeUrl(typeName) {
  const params = new URLSearchParams({
    "page[size]": 100,
    sort: "position",
  });
  return `${BACKEND_URL}${typeName}?${params}`;
}

app.use(errorHandler);
