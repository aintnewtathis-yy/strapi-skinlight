FROM node:20

# Install dependencies for Sharp
RUN apt-get update && apt-get install -y libvips-dev

# Set the working directory
WORKDIR /opt/app

# Copy the package.json and package-lock.json to install dependencies
COPY ./package.json ./package-lock.json ./

# Install main app dependencies
RUN npm install

# Install and build each custom plugin
WORKDIR /opt/app/src/plugins/import-data
RUN npm install && npm run build

WORKDIR /opt/app/src/plugins/yookassa-payment
RUN npm install && npm run build

# Copy the entire app code to the container
WORKDIR /opt/app
COPY . .

# Build the Strapi application
RUN npm run build

# Expose the app port (default: 1337)
EXPOSE 1337

# Set default environment variables (can be configured in CapRover)
ENV HOST=0.0.0.0
ENV PORT=1337

# Start the server
CMD ["npm", "run", "start"]
