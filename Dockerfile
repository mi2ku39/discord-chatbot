FROM denoland/deno:debian-1.27.2
ARG UID=1000
ARG GID=1000
ARG DIR=/workspaces/discord-chatbot
RUN groupmod -g ${GID} deno && usermod -u ${UID} deno
RUN mkdir -p ${DIR} && chown -R ${UID}:${GID} ${DIR}
RUN mkdir /workspaces/memory && chown -R ${UID}:${GID} /workspaces/memory
RUN chown -R ${UID}:${GID} ${DENO_DIR}
WORKDIR ${DIR}
USER deno