#!/usr/bin/env bash

gunicorn -w 4 "app:create_app('app.config.Prod')" -b 0.0.0.0:8000