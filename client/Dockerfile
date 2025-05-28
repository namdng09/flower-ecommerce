# syntax=docker/dockerfile:1.4

FROM --platform=$BUILDPLATFORM node:20-bookworm-slim AS development

WORKDIR /code
COPY package.json /code/package.json
COPY package-lock.json /code/package-lock.json

RUN npm ci
COPY . /code

FROM development AS build

ARG NODE_ENV

ENV NODE_ENV=${NODE_ENV}

RUN npm run build

FROM nginx:1.27.3-alpine-slim

COPY --from=build /code/dist /var/www/dist/

COPY --from=build /code/nginx.conf /etc/nginx/nginx.conf

# Copy the externalized entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]