# Base Node Image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configurations
COPY package*.json ./
COPY server/package*.json ./server/

# Install root dependencies and server dependencies
RUN npm install
RUN cd server && npm install

# Copy application source code
COPY . .

# Build the Vite frontend application
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "server/app.js"]
