FROM node:20-alpine

# Install Python for Python execution
RUN apk add --no-cache python3

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["npm", "start"]
