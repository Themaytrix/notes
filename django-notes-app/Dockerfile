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