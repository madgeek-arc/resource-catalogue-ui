### Install and Build ###
FROM node:22 AS build

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install
COPY . .
ARG configuration=prod
RUN npm run build:$configuration


### Create Container ###
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf.tmpl
COPY env_variables.sh /usr/share/nginx/
COPY --from=build /usr/src/app/dist/*/browser /usr/share/nginx/html

RUN apk update && apk add bash
ENTRYPOINT ["/bin/bash", "/usr/share/nginx/env_variables.sh"]
EXPOSE 80
