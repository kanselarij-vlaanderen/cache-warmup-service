FROM semtech/mu-javascript-template:feature-draft-1.10.0-clean-slim
LABEL maintainer="redpencil.io <info@redpencil.io>"

ENV AUTO_RUN="true"
ENV ENABLE_RECENT_AGENDAS_CACHE="true"
ENV ENABLE_LARGE_AGENDAS_CACHE="true"
ENV ENABLE_CONCEPTS_CACHE="true"
