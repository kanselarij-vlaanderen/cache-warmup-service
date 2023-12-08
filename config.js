const BACKEND_URL = process.env.BACKEND_URL || 'http://cache/';
const CONCEPT_BACKEND_URL = process.env.CONCEPT_BACKEND_URL || BACKEND_URL;
const MASTER_GRAPH = process.env.MASTER_GRAPH || 'http://mu.semte.ch/graphs/organizations/kanselarij';
const PUBLIC_GRAPH = process.env.PUBLIC_GRAPH || 'http://mu.semte.ch/graphs/public';
const AUTO_RUN = ["yes", "true", true, "1", 1, "on"].includes(process.env.AUTO_RUN);
const REQUEST_CHUNK_SIZE = parseInt(process.env.REQUEST_CHUNK_SIZE) || 10;
const ENABLE_RECENT_AGENDAS_CACHE = ["yes", "true", true, "1", 1, "on"].includes(process.env.ENABLE_RECENT_AGENDAS_CACHE);
const ENABLE_LARGE_AGENDAS_CACHE = ["yes", "true", true, "1", 1, "on"].includes(process.env.ENABLE_LARGE_AGENDAS_CACHE);
const ENABLE_CONCEPTS_CACHE = ["yes", "true", true, "1", 1, "on"].includes(process.env.ENABLE_CONCEPTS_CACHE);
const MIN_NB_OF_AGENDAITEMS = Number.parseInt(process.env.MIN_NB_OF_AGENDAITEMS || "70");

const MU_AUTH_ALLOWED_GROUPS = [
  [ // Admin
    { "variables": [], "name": "public" },
    { "variables": [], "name": "authenticated" },
    { "variables": [], "name": "admin" },
    { "variables": [], "name": "impersonation" },
    { "variables": [], "name": "kanselarij-read" },
    { "variables": [], "name": "kanselarij-write" },
    { "variables": [], "name": "ovrb-write" },
    { "variables": [], "name": "sign-flow-read" },
    { "variables": [], "name": "sign-flow-write" },
    { "variables": [], "name": "parliament-flow-read" },
    { "variables": [], "name": "parliament-flow-write" },
    { "variables": [], "name": "clean" }
  ],
  [ // Secretarie / KB
    { "variables": [], "name": "public" },
    { "variables": [], "name": "authenticated" },
    { "variables": [], "name": "kanselarij-read" },
    { "variables": [], "name": "kanselarij-write" },
    { "variables": [], "name": "sign-flow-read" },
    { "variables": [], "name": "sign-flow-write" },
    { "variables": [], "name": "parliament-flow-read" },
    { "variables": [], "name": "parliament-flow-write" },
    { "variables": [], "name": "clean" }
  ],
  [ // OVRB
    { "variables": [], "name": "public" },
    { "variables": [], "name": "authenticated" },
    { "variables": [], "name": "kanselarij-read" },
    { "variables": [], "name": "ovrb-write" },
    { "variables": [], "name": "sign-flow-read" },
    { "variables": [], "name": "parliament-flow-read" },
    { "variables": [], "name": "clean" }
  ],
  [ // Minister
    { "variables": [], "name": "public" },
    { "variables": [], "name": "authenticated" },
    { "variables": [], "name": "minister-read" },
    { "variables": [], "name": "minister-write" },
    { "variables": [], "name": "sign-flow-read" },
    { "variables": [], "name": "sign-flow-write" },
    { "variables": [], "name": "parliament-flow-write" },
    { "variables": [], "name": "parliament-flow-read" },
    { "variables": [], "name": "clean" }
  ],
  [ // Regering / kabinet
    { "variables": [], "name": "public" },
    { "variables": [], "name": "authenticated" },
    { "variables": [], "name": "regering-read" },
    { "variables": [], "name": "regering-write" },
    { "variables": [], "name": "sign-flow-read" },
    { "variables": [], "name": "parliament-flow-read" },
    { "variables": [], "name": "clean" }
  ],
  [ // Overheid
    { "variables": [], "name": "public" },
    { "variables": [], "name": "authenticated" },
    { "variables": [], "name": "overheid-read" },
    { "variables": [], "name": "overheid-write" },
    { "variables": [], "name": "parliament-flow-read" },
    { "variables": [], "name": "clean" }
  ]
];

const CONCEPT_SCHEMES = {
  MEETING_TYPE:
    "http://themis.vlaanderen.be/id/concept-scheme/8030c0c4-aff1-4548-92d9-3299ebc43832",
  ACCESS_LEVELS:
    "http://themis.vlaanderen.be/id/concept-scheme/9b354d36-250b-43d7-887c-db28fe2fc6fb",
  AGENDA_ITEM_TYPES:
    "http://themis.vlaanderen.be/id/concept-scheme/55c9120c-6a3d-49c4-80c8-ed01e9b92a9b",
  DOCUMENT_TYPES:
    "http://themis.vlaanderen.be/id/concept-scheme/559774e3-061c-4f4b-a758-57228d4b68cd",
  DECISION_RESULT_CODES:
    "http://themis.vlaanderen.be/id/concept-scheme/43052680-1c88-47f1-b081-99087afc4497",
  RELEASE_STATUSES:
    "http://themis.vlaanderen.be/id/concept-scheme/49c93ef8-ca21-4ff9-b6d3-8351b410b563",
  USER_ROLES:
    "http://themis.vlaanderen.be/id/concept-scheme/b18acf1a-2a37-4b42-a549-b158d0065092",
  GOVERNMENT_FIELDS:
    "http://themis.vlaanderen.be/id/concept-scheme/0012aad8-d6e5-49e2-af94-b1bebd484d5b",
};

const STATIC_TYPES = [
  'publication-statuses',
  'publication-modes',
  'urgency-levels',
  'regulation-types',
];

export {
  BACKEND_URL,
  CONCEPT_BACKEND_URL,
  MASTER_GRAPH,
  PUBLIC_GRAPH,
  AUTO_RUN,
  ENABLE_RECENT_AGENDAS_CACHE,
  ENABLE_LARGE_AGENDAS_CACHE,
  ENABLE_CONCEPTS_CACHE,
  MIN_NB_OF_AGENDAITEMS,
  MU_AUTH_ALLOWED_GROUPS,
  CONCEPT_SCHEMES,
  STATIC_TYPES,
  REQUEST_CHUNK_SIZE,
};
