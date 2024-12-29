FROM python:3.9.12-alpine as backend-builder


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

RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /app
COPY . .


RUN chmod +x django-script.sh

ENTRYPOINT ["sh", "./django-script.sh" ]