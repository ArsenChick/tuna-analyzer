FROM python:3.10-buster

WORKDIR /tuna

RUN python -m pip install --upgrade pip
RUN pip install gunicorn

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/run_prod.sh .
COPY backend/app ./app/
