# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and env file
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application and env file from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./.env

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"] 