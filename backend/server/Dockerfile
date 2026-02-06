# Use Node.js 20 as base
FROM node:20-slim

# Install Python, Java (OpenJDK), and GCC (build-essential)
RUN apt-get update && apt-get install -y \
    python3 \
    openjdk-17-jdk \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port (Render sets PORT env var, but good for documentation)
EXPOSE 3000

# Start server
CMD ["node", "index.js"]
