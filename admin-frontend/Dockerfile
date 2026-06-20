# Use the official Node.js image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (better caching)
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Start the Vite server and expose it to the host network
CMD ["npm", "run", "dev", "--", "--host"]
