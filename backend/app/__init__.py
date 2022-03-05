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

    ## Обновление токена доступа
    #
    #  Обновляет токен доступа, если его время жизни почти истекло, а пользователь работает в системе
    @app.after_request
    def refresh_expiring_jwts(response):
        try:
            exp_timestamp = get_jwt()["exp"]
            now = datetime.now(timezone.utc)
            target_timestamp = datetime.timestamp(now + timedelta(minutes=30))

            if target_timestamp > exp_timestamp:
                access_token = create_access_token(identity=get_jwt_identity())
                data = response.get_json()

                if type(data) is dict:
                    data["access_token"] = access_token
                    response.data = json.dumps(data)
            return response
        except (RuntimeError, KeyError):
            # Нет валидного JWT токена, не модифицируем запрос
            return response

    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .data_manager import file_manager as fm_blueprint
    app.register_blueprint(fm_blueprint)

    # Создание таблиц, если они не существует
    db.create_all(app=app)

    return app
