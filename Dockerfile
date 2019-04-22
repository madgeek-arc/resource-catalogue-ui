FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf.tmpl
COPY env_variables.sh /usr/share/nginx/
COPY dist/eic-platform /usr/share/nginx/html

RUN apk update && apk add bash
ENTRYPOINT ["/bin/bash", "/usr/share/nginx/env_variables.sh"]
EXPOSE 80
