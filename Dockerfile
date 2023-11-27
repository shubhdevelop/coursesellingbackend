FROM mhart/alpine-node AS base
WORKDIR app/src
COPY package*.json ./
RUN npm install

FROM base AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS production
COPY . .
RUN npm prune --production
EXPOSE 3000
CMD ["npm", "run", "start"]

