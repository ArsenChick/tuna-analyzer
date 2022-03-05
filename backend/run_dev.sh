#!/usr/bin/env bash

export FLASK_ENV=development
export FLASK_DEBUG=1
export FLASK_APP="app:create_app('app.config.Dev')"

flask run
