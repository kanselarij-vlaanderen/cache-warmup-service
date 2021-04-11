# cache-warmup-service

Microservice to warmup mu-cache and the internal mu-cl-resources cache.

The service contains a very primitive and naive implementation to improve performance of agendaitems loading. For each configured auth allowed group a request is executed to fetch the agendaitems of the most recent and largest agendas. The request exactly matches the request executed by the frontend. As such the cache gets warmed up before a user hits the endpoint with a cold cache.

The setup is only a short-term solution and is rather brittle. Each change to the mu-authorization configuration and/or agendaitem loading in the frontend requires an implementation change in this service.

## Getting started
### Adding the service to your stack
Add the following snippet to your `docker-compose.yml` file

```yaml
services:
  cache-warmup:
    image: kanselarij/cache-warmup-service:latest
```

## Reference
### Configuration
The following settings can be configured through environment variables:
- **BACKEND_URL**: URL of the backend service to send requests to (default `http://cache/`). Must end with a trailing slash (`/`).
- **MASTER_GRAPH**: graph to fetch agenda's from using a sudo-query (default `http://mu.semte.ch/graphs/organizations/kanselarij`)
- **AUTO_RUN**: runs the warmup process automatically on startup if set to `"true"` (default `"false"`)
- **ENABLE_RECENT_AGENDAS_CACHE**: runs the warmup process for agendas modified during the last year if set to `"true"` (default `"true"`)
- **ENABLE_LARGE_AGENDAS_CACHE**: runs the warmup process for large agendas if set to `"true"` (default `"true"`)
- **MIN_NB_OF_AGENDAITEMS**: minimum number of agendaitems for an agenda to be considered 'large' (default `"70"`)

### Endpoints
#### POST /warmup
Manually trigger the warmup process.

For each configured mu-auth-allowed groups the agendaitems will be fetched:
- for each agenda modified last year if `ENABLE_RECENT_AGENDAS_CACHE` is `true`
- for each large agenda if `ENABLE_LARGE_AGENDAS_CACHE` is `true`

