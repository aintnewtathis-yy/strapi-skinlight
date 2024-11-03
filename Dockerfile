FROM node:20

# Install dependencies
RUN apt-get update && apt-get install -y libvips-dev

# Set up work directory
WORKDIR /opt/app

# Copy package.json and package-lock.json
COPY ./package.json ./package-lock.json ./

# Install dependencies
RUN npm install

# Copy the app code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 1337

# Command to run the server
CMD ["npm", "run", "start"]
