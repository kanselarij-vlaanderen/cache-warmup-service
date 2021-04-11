const BACKEND_URL = process.env.BACKEND_URL || 'http://cache/';
const MASTER_GRAPH = process.env.MASTER_GRAPH || 'http://mu.semte.ch/graphs/organizations/kanselarij';

const AUTO_RUN = ["yes", "true", true, "1", 1, "on"].includes(process.env.AUTO_RUN);

const MU_AUTH_ALLOWED_GROUPS = [
  [ // Admin
    { "variables": [], "name": "public" },
    { "variables": [], "name": "o-admin-on-public" },
    { "variables": [], "name": "o-admin-roles" },
    { "variables": [], "name": "o-kanselarij-all" },
    { "variables": [], "name": "clean" }
  ],
  [ // Kanselarij
    { "variables": [], "name": "public" },
    { "variables": [], "name": "o-kanselarij-on-public" },
    { "variables": [], "name": "o-kanselarij-all" },
    { "variables": [], "name": "clean" }
  ],
  [ // OVRB
    { "variables": [], "name": "public" },
    { "variables": [], "name": "ovrb" },
    { "variables": [], "name": "clean" }
  ],
  [ // Minister
    { "variables": [], "name": "public" },
    { "variables": [], "name": "o-minister-read" },
    { "variables": [], "name": "clean" }
  ],
  [ // Regering / kabinet
    { "variables": [], "name": "public" },
    { "variables": [], "name": "o-intern-regering-read" },
    { "variables": [], "name": "clean" }
  ],
  [ // Overheid
    { "variables": [], "name": "public" },
    { "variables": [], "name": "o-intern-overheid-read" },
    { "variables": [], "name": "clean" }
  ]
];

export {
  BACKEND_URL,
  MASTER_GRAPH,
  AUTO_RUN,
  MU_AUTH_ALLOWED_GROUPS
};
