FROM node:8 as builder

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN yarn install --force \
 && yarn build \
 && yarn cache clean

FROM node:8

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .

ENV NODE_ENV production

EXPOSE 5000
CMD [ "yarn", "start" ]
