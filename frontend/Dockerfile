# 1. Build stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

COPY vite.config.ts ./

COPY tsconfig.json ./
COPY tsconfig.node.json ./

# Install dependencies
RUN rm -rf node_modules package-lock.json && npm install

# Copy source code
COPY . .

# Run the development server
EXPOSE 5173
CMD ["npm", "run", "dev"]
