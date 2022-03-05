## @package app.models
#  Модели данных

from . import db

## Модель пользователя
#
# Определяет представление пользователя в БД
class User(db.Model):
    ## Уникальный ID пользователя. Первичный ключ.
    id = db.Column(db.Integer, primary_key=True)
    ## Имя пользователя для входа в систему
    username = db.Column(db.String(100), unique=True)
    ## Хэш пароля пользователя.
    password = db.Column(db.String(100))
