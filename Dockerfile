# Use the official Node.js 20 image
FROM node:20-slim

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy local code to the container image
COPY . .

# Build the frontend
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Run the web service on container startup
CMD [ "node", "server.mjs" ]
