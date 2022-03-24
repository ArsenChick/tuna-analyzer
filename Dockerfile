FROM debian:11

WORKDIR /build

RUN apt update -y && apt upgrade -y
RUN apt install -y build-essential python3 python3-pip nodejs npm

COPY frontend /build
RUN npm install
RUN npm run build

RUN ls -la

WORKDIR /tuna

RUN python3 -m pip install --upgrade pip
RUN python3 -m pip install gunicorn

COPY backend/requirements.txt .
RUN python3 -m pip install -r requirements.txt

COPY backend/run_prod.sh .
COPY backend/app ./app/

RUN mkdir -p ./app/static
RUN mkdir -p ./app/templates

RUN cp -r /build/build/static ./app/
RUN cp /build/build/*.json ./app/static/
RUN cp /build/build/*.png ./app/static/
RUN cp /build/build/*.ico ./app/static/
RUN cp /build/build/*.txt ./app/static/
RUN cp /build/build/index.html ./app/templates/
