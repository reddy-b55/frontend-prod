# ---------- Builder Stage ----------
FROM node:18 AS builder

WORKDIR /app

# Increase Node memory to avoid SIGKILL
ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build


# ---------- Production Stage ----------
FROM node:18-slim

WORKDIR /app

ENV NODE_ENV=production

# Copy only required files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

CMD ["npm", "start"]
