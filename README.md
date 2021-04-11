# cache-warmup-service

Microservice to warmup mu-cache and the internal mu-cl-resources cache.

The service contains a very primitive and naive implementation to improve performance of agendaitems loading. For each configured auth allowed group a request is executed to fetch the agendaitems of agendas that have been modified last year. The request exactly matches the request executed by the frontend. As such the cache gets warmed up before a user hits the endpoint with a cold cache.

The setup is only a short-term solution and is rather brittle. Each change to the mu-authorization configuration and/or agendaitem loading in the frontend requires an implementation change in this service.

## Getting started
### Adding the service to your stack
_Describe how to add the service to a stack_

## Reference
### Configuration
_Describe configuration options_



