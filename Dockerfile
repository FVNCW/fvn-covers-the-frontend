FROM node:24-alpine

COPY . /app
WORKDIR /app
RUN npm i -g pnpm
RUN pnpm i
RUN pnpm build

ENTRYPOINT [ "pnpm", "preview" ]
