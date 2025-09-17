# Multi-stage Dockerfile for both development and production
FROM node:22-alpine AS base
WORKDIR /app
RUN apk update && apk upgrade && apk add --no-cache libc6-compat

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate && npx prisma migrate dev --name init
EXPOSE 3000

CMD ["npm", "run", "start"] 