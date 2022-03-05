FROM python:3.10-buster

WORKDIR /src

RUN python -m pip install --upgrade pip
RUN pip install gunicorn

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY run_prod.sh .
COPY app ./app/
