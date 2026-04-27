FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the API port
EXPOSE 3000

# Start the application (runs dist/index.js)
CMD ["npm", "start"]
