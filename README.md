# DOCKERIZING AND DEPLOYING A DJANGO REACT APPLICATION 
Our application is a simple notes app built using Django, a popular Python-based web framework, for the backend, and React, a front-end JavaScript library, for the frontend. The code for this project is available in my repository, notes. We deploy the application using Nginx as the web server and Docker for containerization.

Nginx serves the static files from the frontend and also acts as a reverse proxy to the backend server. To enable communication between the backend and Nginx, we use Gunicorn, a Python WSGI (Web Server Gateway Interface) HTTP server.

In this article, we discuss our initial, novice approach to containerizing the application, highlight the challenges faced, and explore optimal solutions for a successful deployment.

## INITIAL PROJECT STRUCTURE
This tree represents the structure of our notes application:

•	/django-notes-app/: The directory containing our Django project.
•	/django-notes-app/frontend/: The directory for the React frontend. (Note: The React project can be located outside the django-notes-app directory; for example, the frontend directory can be placed at the root of the project.) This directory also contains the Dockerfile for the frontend container.
•	/django-notes-app/requirements.txt: This file lists all the dependencies required for the Django project.
•	/nginx/: The directory containing the Dockerfile for the Nginx container, along with the Nginx configuration file.

![Image of initail project structure](/assets/init_struct.png)
