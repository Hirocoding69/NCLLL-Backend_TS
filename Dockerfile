FROM node:20.18-alpine AS builder

WORKDIR /builder
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM node:20.18-alpine AS production
WORKDIR /app

RUN apk update && \
  apk add curl && \
  rm -rf /var/cache/apk/*

COPY package.json yarn.lock ./
RUN yarn install --production
COPY --from=builder ./builder/dist ./dist
COPY --from=builder ./builder/locales ./locales

ARG APP_PORT
ARG APP_TYPE

# Add conditional health check
HEALTHCHECK --interval=5s --timeout=60s --start-period=10s CMD \
  [ -z "$APP_TYPE" ] && curl --fail http://localhost:${APP_PORT}/health-check || exit 0

CMD ["yarn", "start"]
