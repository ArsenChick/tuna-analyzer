## @package app.config
#  Конфиги приложения

import tempfile
from datetime import timedelta

## Базовый конфиг приложения
class DefaultConfig(object):
    ## Активация тестового окружения
    TESTING = False
    ## Отслеживать изменения объектов и посылать сигналы
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ## Директория для загрузки файлов
    UPLOAD_FOLDER = "../tuna_uploads"
    ## Время жизни JWT токена
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    ## Место хранения JWT токена
    JWT_TOKEN_LOCATION = ["headers"]
    ## Время до обновления токена
    REFRESH_DELTA = timedelta(hours=12)

## Продакшн конфиг приложения
#
#  TODO: ключ из envar
#  TODO: БД
#  TODO: UPLOAD_FOLDER
class Prod(DefaultConfig):
    ## Ключ для подписывания куки-файлов
    SECRET_KEY = 'very-very-secret'
    ## Ключ для JWT
    JWT_SECRET_KEY = 'very-secret-jwt-key'
    ## Ссылка на БД
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://tuna:tuna_db_pass@tuna-db/tuna_db'


## Конфиг для разработки
class Dev(DefaultConfig):
    ## Ключ для подписывания куки-файлов
    SECRET_KEY = 'dev-secret-key'
    ## Ключ для JWT
    JWT_SECRET_KEY = 'JWT-dev'
    ## Ссылка на БД
    SQLALCHEMY_DATABASE_URI = 'sqlite:///db.sqlite'

## Конфиг для тестирования
class Test(DefaultConfig):
    ## Активация тестового окружения
    TESTING = True
    ## Ключ для подписывания куки-файлов
    SECRET_KEY = 'test-secret-key'
    ## Ключ для JWT
    JWT_SECRET_KEY = 'JWT-test'
    ## Временная БД в ОЗУ
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    ## Директория для загрузки файлов
    UPLOAD_FOLDER = tempfile.mkdtemp(prefix="tuna_")
    ## Время жизни JWT токена
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=60)
    ## Время до обновления токена
    REFRESH_DELTA = timedelta(seconds=1)
