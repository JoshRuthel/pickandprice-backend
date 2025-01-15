FROM node:18-alpine

WORKDIR /app

# Copy the .env file and ca-certificate.crt file into the Docker image
COPY .env .env
COPY ca-certificate.crt ca-certificate.crt

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the files
COPY . .

EXPOSE 8080

CMD ["npm", "start"]