FROM denoland/deno:debian-1.27.2
ARG UID=1000
ARG GID=1000
ARG DIR=/workspaces/discord-chatbot
ARG DISCORD_TOKEN
ARG GUILD_ID
RUN groupmod -g ${GID} deno && usermod -u ${UID} deno
RUN mkdir -p ${DIR} && chown -R ${UID}:${GID} ${DIR}
RUN chown -R ${UID}:${GID} ${DENO_DIR}
WORKDIR ${DIR}
USER deno
COPY . /workspaces/discord-chatbot
ENV DISCORD_TOKEN ${DISCORD_TOKEN}
ENV GUILD_ID ${GUILD_ID}
RUN deno task build
ENTRYPOINT [ "bash", "-c" ]
CMD [ "./discord-chatbot" ]