FROM node:15.0.1-alpine3.10

RUN mkdir app
COPY node_modules app/node_modules
COPY src app/src 

CMD [ "node", "app/src/interfaces/cli.js" ]


