import { sparqlEscapeDateTime } from 'mu';
import { querySudo as query } from '@lblod/mu-auth-sudo';
import { MASTER_GRAPH, MIN_NB_OF_AGENDAITEMS } from './config';

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

async function fetchLargeAgendas() {
  const queryResult = await query(`
    PREFIX besluitvorming: <http://data.vlaanderen.be/ns/besluitvorming#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    SELECT ?agendaId ?count WHERE
    {
      {
        SELECT DISTINCT ?agendaId (COUNT(?agendaitem) as ?count) {
          GRAPH <${MASTER_GRAPH}> {
            ?agenda a besluitvorming:Agenda ;
              mu:uuid ?agendaId ;
              dct:hasPart ?agendaitem .
          }
        }
        GROUP BY ?agendaId
      }
      FILTER (?count > ${MIN_NB_OF_AGENDAITEMS})
    } ORDER BY DESC(?count)`);
  return queryResult.results.bindings.map(b => b['agendaId'].value);
}

export {
  fetchMostRecentAgendas,
  fetchLargeAgendas
}
