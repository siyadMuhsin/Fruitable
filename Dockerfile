# 1. Use the official Node.js base image
FROM node:20

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json (only dependency info)
COPY package*.json ./

# 4. Install project dependencies
RUN npm install

# 5. Copy the rest of your backend code into the container
COPY . .

# 6. Expose the port your app runs on
EXPOSE 3000

# 7. Start the app
CMD ["npm", "start"]
