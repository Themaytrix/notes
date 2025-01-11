# DOCKERIZING AND DEPLOYING A DJANGO REACT APPLICATION 
Our application is a simple notes app built using Django, a popular Python-based web framework, for the backend, and React, a front-end JavaScript library, for the frontend. The code for this project is available in my repository, notes. We deploy the application using Nginx as the web server and Docker for containerization.

Nginx serves the static files from the frontend and also acts as a reverse proxy to the backend server. To enable communication between the backend and Nginx, we use Gunicorn, a Python WSGI (Web Server Gateway Interface) HTTP server.

In this documentation, we discuss our initial, novice approach to containerizing the application, highlight the challenges faced, and explore optimal solutions for a successful deployment.


## INITIAL PROJECT STRUCTURE
This tree represents the structure of our notes application:

- /django-notes-app/: The directory containing our Django project.
- /django-notes-app/frontend/: The directory for the React frontend. (Note: The React project can be located outside the django-notes-app directory; for example, the frontend directory can be placed at the root of the project.) This directory also contains the Dockerfile for the frontend container.
- /django-notes-app/requirements.txt: This file lists all the dependencies required for the Django project.
- /nginx/: The directory containing the Dockerfile for the Nginx container, along with the Nginx configuration file.

![Image of initail project structure](/assets/init_struct.png)



## CONFIGURING DJANGO PROJECT
Inside /django-notes-app/noteapp/settings.py is the configuration for our Django project. Since we are using a MySQL database, we configure the DATABASES block to include our MySQL credentials. Note that the host is set to the name of our MySQL container, which is db. To connect to an AWS RDS instance, you would set the host to the endpoint of the RDS instance instead.

```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv("MYSQL_DATABASE"),
        'USER' : os.getenv("MYSQL_USER"),
        'PASSWORD' : os.getenv("MYSQL_PASSWORD"),
        'HOST': 'db',  # point to the database host. eg endpoint if hosted in an aws rds instance or service name of docker container
        'PORT': '3306',  # Default MySQL port
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"
        }
    }
}
```


Using the Python module python-dotenv, we can access the environment variable we set in our .env file. 

```
MYSQL_ROOT_PASSWORD="your_root_password"
MYSQL_DATABASE="your_database_name"
MYSQL_USER="your_user_name"
MYSQL_PASSWORD="your_database_password"

```

Set your ALLOWED_HOSTS = [‘*’] to accept any host and CORS_ALLOW_ALL_ORIGINS = True to avoid CORS header errors. Also, add a LOGGING block to view Python error messages in your container logs during containerization or in production

```
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',  # Change to INFO in production
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

## CONTAINERIZING APPLICATION WITH DOCKER

In this section, we discuss the initial approach used to containerize our application, the issues that arose with this approach, and the optimal solutions to address these issues. In our docker-compose.yml file, we define 4 services for our 4 containers: the backend service, frontend service, MySQL/DB service, and Nginx service. Additionally, we utilize Docker volumes to store persistent data across containers.

In the subsequent sections, I will present each Dockerfile and its corresponding block in the docker-compose.yml file.

### Django Container
Our Dockerfile for the backend container is located in the /django-notes-app directory. We specify the base image for the backend container as Python and run commands to update and install the necessary dependencies for the Python environment.

```
# define base image
FROM python:latest

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    default-libmysqlclient-dev \
    pkg-config \
    && apt-get clean

# copy and run requirements.txt
COPY ./requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /app
COPY . .

RUN chmod +x django-script.sh

ENTRYPOINT [ "./django-script.sh" ]

```

We copy the requirements.txt file into the container’s root directory and use pip to install all dependencies listed in it. Next, we create a working directory inside the container, named /app in this instance. All files from the /django-notes-app directory are then copied to the container’s working directory. Additionally, we create an executable script to run Django commands when the container is initiated. This script also starts the Gunicorn server, exposing it on port 8000.

Note: Add the frontend directory to your .dockerignore file to prevent it from being copied to the container if your frontend files are within the Django project directory.
Under the services block in the docker-compose.yml file:
- Define the build configuration to target the directory containing the Dockerfile for the Python service.
- Specify a container name of your choice and expose the required container ports.
- Include a depends_on block because the backend container relies on the MySQL container. This dependency is necessary since Django migrates data to the MySQL database host, as specified earlier in the settings.py configuration.
- Configure the backend container to wait for the successful startup of the MySQL container before beginning its initialization.

```
  backend:
    build: 
      context: ./django-notes-app #define directory containing the services dockerfile
      dockerfile: Dockerfile
    container_name: djanngo_backend
    # ports to expose
    ports:
      - "8000:8000"
    depends_on: 
      db:
        condition: service_healthy

```

### MYSQL/db Container

For the MySQL container, we use the official MySQL image from Docker Hub and do not define a custom Dockerfile for this container. We expose the necessary MySQL ports and define a volume to persist the MySQL container’s configuration data.
The MySQL container requires credentials for setup, which are specified in an .env file. This .env file is identical to the one used earlier in the Django configuration section.
Since the backend service depends on the MySQL container, we perform health checks and tests to ensure the database container is set up successfully. These configurations are defined within the services block of the docker-compose.yml file.

```
  db:
    image: mysql:latest
    ports:
      - "3306:3306"
    env_file:
      - ./.env
    volumes:
      - db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 3

```

### Frontend Container
The Dockerfile for the frontend service is located in the /django-notes-app/frontend/ directory. We specify a Node.js base image and create a working directory in the container named /frontend.

We copy package.json and package-lock.json to the working directory. The package.json file contains the dependencies for our React application. Next, we run npm install to install these dependencies.

Afterward, we copy the local frontend directory into the container’s working directory. We then run npm build to generate the React static files and start the React server.

```
# define base image
FROM node:19.6.0

# define working directory inside docker image
WORKDIR /frontend

# copy files from current directory to image directory
COPY package.json package-lock.json ./

# run commmand
RUN npm install --legacy-peer-deps && ls node_modules/react-scripts

COPY . .

RUN npm run build

CMD ["npm", "start"]

```
In the docker-compose.yml file:
- Define the build context to point to the directory containing the Dockerfile.
- Create a volume to persist the directory containing the React build files.

```
frontend:
    build: 
      context: ./django-notes-app/frontend
      dockerfile: Dockerfile
    container_name: frontend
    volumes:
      - frontend_build:/frontend/build

```

### Nginx Container
The Dockerfile for the Nginx service is located in the /nginx directory. We create an nginx.conf file containing our custom Nginx configuration. In the Dockerfile, we specify the Nginx base image and copy the custom configuration file to replace the default configuration of the Nginx container.

```
FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

```
In the docker-compose.yml file:
- Specify the build context pointing to the directory containing the Dockerfile.
- Expose the required port for the Nginx container.
- Use the frontend_build volume to copy the React build static files into the Nginx container at /var/www/frontend.
- Define dependencies for the Nginx container, specifically the frontend and backend services. The purpose of these dependencies is clarified in the nginx.conf file.

```
nginx:
    build: 
      context: ./nginx
      dockerfile: Dockerfile
    ports:
      - 80:80
    volumes:
      - frontend_build:/var/www/frontend
    depends_on:
      - frontend
      - backend

```
The nginx.conf file is configured to specify the default port for the web server to listen on, typically port 80. The server_name directive is set to the public IP address of the AWS EC2 instance when hosting the application, but this line can be commented out or replaced with localhost for local testing. The location / block is configured to serve the application’s homepage by pointing to the index.html file located at /var/www/frontend/index.html, which was copied from the React build. A separate location /api/ block is defined to handle API requests, acting as a reverse proxy to the backend server with a proxy_pass directive pointing to http://backend:8000. Here, “backend” refers to the backend service name defined in the docker-compose.yml file, and port 8000 is the backend server’s exposed port. Finally, another block specifies the directory /var/www/frontend/static/ to serve the static files generated by the React build, ensuring that all application assets are correctly handled. This configuration enables Nginx to serve the React frontend and route API calls to the backend seamlessly.

```
server{

    listen 80;
    # pinging aws to get instance public ip
    server_name $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4);
    
    # serve the index.html file at the homepage.
    location / {
        root /var/www/frontend/;
        index index.html;
        try_files $uri /index.html;
    }
    
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    location = /favicon.ico {
        log_not_found off;  # Prevent logging for missing favicon   
    }
    location /static/{
        alias /var/www/frontend/static/;
    }
}

```

Finally in our docker-compose.yml, we mount our defined volumes

```
volumes:
  db-data:
    driver: local
  frontend_build:

```

## CHALLENGES
This simple notes application is deployed on an AWS t2micro free-tier EC2 instance, provisioned using a Terraform.You can find this on my GitHub repository, [l-terraform](https://github.com/Themaytrix/l-terraform). We provision our instance with a user-data name newscafforld.sh. The instance is initialized with a user-data script named newscaffold.sh, a simple Bash script that installs all the necessary dependencies for the application to run.

There are several approaches to deploying Docker containers, such as hosting images in an image repository like Docker Hub or AWS ECR. However, for educational purposes, we opted to clone the project repository directly from GitHub onto the EC2 instance. In our newscaffold.sh script we navigate to our project root directory and run the docker-compose up --build command in detach mode. 

During deployment, we noticed that the application did not successfully start. In many cases, the EC2 instance froze while attempting to run the containers. This issue arises because the t2micro free-tier EC2 instance, with its 2 GiB of RAM, struggles to handle the resource demands of running multiple large Docker images.

This image shows the sizes of our docker images built using our initial approach. 
![Initial docker image sizes](/assets/init_docker_image.png)


We observed that the frontend container is 1.53 GB in size, while the backend container is 1.36 GB. This highlights that our initial approach was not optimal. In the next section, we will explore more efficient techniques for containerizing our application with Docker.


## OPTIMAL SOLUTION

In our optimal solution approach we adopt strategies like using alpine versions for our base images, and multi-stage builds. Of course this affects our project structure.

![new project structure](/assets/new_data_struct.png)

We move the nginx.conf file to the frontend directory, and I will explain the reason for this change later. Additionally, we eliminate the nginx directory entirely.

In this optimal approach, we aim to spin up three containers: backend, MySQL database, and Nginx. As a result, our docker-compose.yml file now defines three services.

In each Dockerfile, we use Alpine versions for the base images, which results in lightweight containers. For the backend container, we define the Python base image as an Alpine version.

Since Alpine is based on Alpine Linux, the dependencies for the Python environment are adjusted to use Linux-specific commands.

```
# use alpine for lightweigt build
FROM python:3.9.12-alpine as backend-builder

# install necessary dependencies
RUN apk update && apk add --no-cache \
    gcc \
    libpq-dev \
    musl-dev \
    python3-dev \
    libffi-dev \
    libmagic \
    pkgconfig \
    mariadb-dev \
    && apk add --no-cache --virtual .build-deps build-base

# copy and run requirements.txt
COPY ./requirements.txt .
# install project dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
# create working directory
WORKDIR /app
# copy from current directoy to working directory
COPY . .

# make our django-script.sh an executable
RUN chmod +x django-script.sh

# run this on script on entry of container
ENTRYPOINT ["sh", "./django-script.sh" ]

```

Our MYSQL container does not need any optimization and it is also built using an official image from Docker Hub so we leave that as it is. For our Nginx container, we adopt a multi-stage build technique.

### Multi-stage Docker Build
Docker multi-stage builds are a feature that allows you to create smaller and more efficient Docker images by using multiple stages in your Dockerfile. Each stage is defined using a separate FROM statement. Typically, the final stage is the runtime image, which includes only the necessary artifacts, while all intermediate build stages are discarded. For a deeper understanding of multi-stage builds, you can refer to the official Docker documentation.

In the context of our application, it is intuitive to discard the frontend container and retain only the Nginx container, as the React application will only serve static files. These static files are copied into the Nginx container, making the frontend container redundant. In our Dockerfile, we run the build process for the frontend, then copy the React build files into the Nginx container. This explains why we moved the nginx.conf file to the frontend directory. This allows Nginx to serve the static files without the need for a separate frontend container.

```
FROM node:19.6.0-alpine as frontend-builder

# define working directory inside docker image
WORKDIR /frontend

# copy files from current directory to image directory
COPY package.json package-lock.json ./

# run commmand
RUN npm install --legacy-peer-deps && ls node_modules/react-scripts

COPY . .

RUN npm run build

FROM nginx:alpine

# copy react build files from frontend-builder
COPY --from=frontend-builder /frontend/build /var/www/frontend

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

```

In our first FROM statement, we specify the Alpine-based Node.js image and tag this build as frontend-builder using the as keyword. We then run the necessary commands to build the React static files.

In the second FROM statement, which defines the final runtime image, we use the Alpine-based Nginx image. We copy the React static files from the frontend-builder’s /frontend/build directory into the specified directory in the Nginx container. We also copy our custom nginx.conf file to override the default Nginx configuration within the container.

Subsequently, we discard unnecessary volumes in the docker-compose.yml file, retaining only the volume for the MySQL database.

```
services:
  backend:
    build: 
      context: ./django-notes-app
      dockerfile: Dockerfile
    container_name: backend
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
  
  db:
    image: mysql:latest
    ports:
      - "3306:3306"
    env_file:
      - ./.env
    volumes:
      - db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-u", "root", "-p$MYSQL_ROOT_PASSWORD"]
      interval: 10s
      timeout: 5s
      retries: 3

  nginx:
    build: 
      context: ./django-notes-app/frontend
      dockerfile: Dockerfile
    ports:
      - 80:80
    depends_on:
    - backend
      # - frontend
      

volumes:
  db-data:
    driver: local

```

## OPTIMIZED DOCKER IMAGES
We can observe a significant reduction in the size of our Docker images.
![optimized docker images](/assets/optimal_docker_images.png)

## DEPLOYMENT OF APPLICATION

The application is deployed on an AWS t2.micro EC2 instance, provisioned using Terraform. In our user-data field we specify our executable script. Our executable file is name “newscaffold.sh”. This file contains commands that update the instance, install necessary dependencies, clone the project repository from GitHub, navigate to the project root directory, and runs docker-compose up --build -d to build and launch the containers in detached mode. To access the application, users can simply enter the public IPv4 address of the EC2 instance into their browser. [L-terraform](https://github.com/Themaytrix/l-terraform) is the repository that contains our terraform script and executable script for our user data.

![example](/assets/image.png) 
![example 2](/assets/image2.png)
![example 3](/assets/image3.png)
![example 4](/assets/image4.png)


## CONCLUSION

In the next deployment of our application, our t2micro free tier EC2 instance runs smoothly without any freezes or lags. This demonstrates that adopting optimal techniques for Dockerizing our application helps reduce the  cost on our compute recourses. 