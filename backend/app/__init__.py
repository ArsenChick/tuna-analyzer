import json
from datetime import datetime, timezone
from flask import Flask
from flask_jwt_extended import (JWTManager, create_access_token, get_jwt,get_jwt_identity, jwt_required)
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

    ## Функция автоматического обновления токена
    #
    #  Вызвается после каждого запроса
    #  Если токен доступа скоро истечет, то создает новый токен
    @app.after_request
    @jwt_required(optional=True)
    def refresh_expiring_jwts(response):
        try:
            maybe_jwt: dict = get_jwt()

            # Нет токена, ничего не делаем      
            if not maybe_jwt:
                return response

            exp_datetime = maybe_jwt["exp"]
            now = datetime.now(timezone.utc)
            target_timestamp = datetime.timestamp(now + app.config["REFRESH_DELTA"])

            if target_timestamp > exp_datetime:
                access_token = create_access_token(identity=get_jwt_identity())
                print(response.json)
                current_json = response.get_json()
                current_json["new_access_token"] = access_token
                response.data = json.dumps(current_json)
                print(response.json)

            return response
        except Exception as err:
            print(err)
            return response

    # Создание таблиц, если они не существует
    db.create_all(app=app)

    return app
