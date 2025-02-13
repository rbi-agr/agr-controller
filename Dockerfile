# Use Node.js version 14 as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

RUN npm install

# Install Prisma globally
RUN npm install -g prisma

# Copy the rest of the application code to the container
COPY . .

# COPY sample.env .env

# Generate Prisma client
RUN prisma generate
RUN #prisma migrate deploy

# Build nest file
RUN npm run build

# Expose the port that the Nest.js application will run on
EXPOSE 3000

# Command to run the Nest.js application
CMD ["npm", "run", "start:prod"]