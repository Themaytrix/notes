FROM node:19.6.0-alpine as frontend-builder

# define working directory inside docker image
WORKDIR /frontend

# copy files from current directory to image directory
COPY package.json package-lock.json ./

# run commmand
RUN npm install --legacy-peer-deps && ls node_modules/react-scripts

# Ensure react-scripts is installed properly
# RUN npm install react-scripts

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=frontend-builder /frontend/build /var/www/frontend

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# COPY ../django-notes-app/frontend/build /var/www/frontend