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



