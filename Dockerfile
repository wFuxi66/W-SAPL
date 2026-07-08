FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install --production && npm cache clean --force

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY index.js .
CMD ["node", "index.js"]
