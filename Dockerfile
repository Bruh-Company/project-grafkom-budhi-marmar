# Dockerfile for Bun
FROM oven/bun:slim as base

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json bun.lockb* ./

# Install dependencies
# RUN bun install --production

# Copy the application files
COPY . .

# Expose the port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Run the server
CMD ["bun", "start"]
