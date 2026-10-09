# Konteks build adalah artifact standalone tervalidasi, bukan root repository.
ARG NODE_IMAGE=node:22-bookworm-slim
FROM ${NODE_IMAGE}
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --chown=node:node . ./
USER node
EXPOSE 3000
CMD ["node", "server.js"]
