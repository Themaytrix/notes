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