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


## Модель тональностей
#
# Определяет представление тональностей в БД
class Tone(db.Model):
    ## Уникальный ID тональности. Первичный ключ.
    id = db.Column(db.Integer, primary_key=True)
    ## Название тональности
    tone = db.Column(db.String(100), unique=True)


## Модель результатов анализа
#
# Определяет представление результатов анализа в БД
class Result(db.Model):
    ## Уникальный ID результата анализа. Первичный ключ.
    id = db.Column(db.Integer, primary_key=True)
    ## Темп анализируемой композиции
    bpm = db.Column(db.Integer)
    ## Тональность анализируемой композиции
    tone = db.relationship('Tone', backref=db.backref('result', lazy=True))
    idTone = db.Column(db.Integer, db.ForeignKey('tone.id'), nullable=False)
    ## Танцевальность анализируемой композиции
    dance = db.Column(db.Integer)
    ## Энергичность анализируемой композиции
    energy = db.Column(db.Integer)
    ## Настроение анализируемой композиции
    happiness = db.Column(db.Integer)
    ## Версия модели, на которой проводился анализ
    version = db.Column(db.Integer)
    ## Дата и время обработки композиции
    date = db.Column(db.DateTime)
    ## Пользователь, запросивший анализ
    user = db.relationship('User', backref=db.backref('result', lazy=True))
    idUser = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ## Путь к аудиофайлу, который анализировался
    file = db.Column(db.String(1024), unique=True)
    ## Флаг, который определяет удален ли пользователем результат
    isDeleted = db.Column(db.Boolean)
