import json
from datetime import datetime, timedelta, timezone
from flask import Flask
from flask_jwt_extended import (JWTManager, create_access_token, get_jwt,
                                get_jwt_identity)
from flask_sqlalchemy import SQLAlchemy

## Объект для работы с базой данных
db = SQLAlchemy()

## Объект для работы с JWT токенами
jwt = JWTManager()

## "Фабрика" для создания приложения
#
# Создаёт приложение, инициализирует подключение к БД.
# Подключает модули с эндпоинтами.
#
# @param config класс с конфигом из модуля app.config
def create_app(config='app.config.DefaultConfig'):
    app = Flask(__name__)

    app.config.from_object(config)
    db.init_app(app)
    jwt.init_app(app)

    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .data_manager import data_manager as data_blueprint
    app.register_blueprint(data_blueprint)

    # Создание таблиц, если они не существует
    db.create_all(app=app)

    return app
