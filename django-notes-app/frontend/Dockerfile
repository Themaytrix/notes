# define base image
FROM node:19.6.0

# define working directory inside docker image
WORKDIR /frontend

# copy files from current directory to image directory
COPY package.json package-lock.json ./

# run commmand
RUN npm install 

# Ensure react-scripts is installed properly
# RUN npm install react-scripts

COPY . .


RUN npm run build



EXPOSE 80

CMD ["npm", "start"]

