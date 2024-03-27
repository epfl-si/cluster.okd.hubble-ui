FROM registry.access.redhat.com/ubi8/nodejs-20:latest AS build
USER root
RUN npm i -g yarn

ADD . /usr/src/app
WORKDIR /usr/src/app
RUN yarn install && yarn build

FROM registry.access.redhat.com/ubi8/nginx-122:latest

COPY --from=build /usr/src/app/dist /tmp/src
COPY docker/nginx.conf .

USER 1001
RUN /usr/libexec/s2i/assemble

CMD /usr/libexec/s2i/run
