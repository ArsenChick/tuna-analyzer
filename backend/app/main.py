## @package app.main
#  Основные страницы
#
#  Основные эндпоинты приложения

from flask import Blueprint, render_template, current_app, send_from_directory
from . import db
import os
from werkzeug.security import generate_password_hash

from .models import Tone, User
from .tones import tone_strings

main = Blueprint('main', __name__)

## Возвращает основной файл React приложения
@main.route('/')
def index():
    return render_template('index.html')

## Возврщает статичный файл из директории static
@main.route('/<path:path>')
def static_file(path):
    return send_from_directory(current_app.root_path, path)

## Возврщает файл из директории workers
@main.route('/workers/<path:path>')
def workers_file(path):
    return send_from_directory(os.path.join(current_app.root_path, 'workers'), path)

## Возврщает файл из директории models
@main.route('/models/<path:path>')
def models_file(path):
    return send_from_directory(os.path.join(current_app.root_path, 'models'), path)

## Преинициализация БД
#
#  Создает и заполняет таблицы начальными значениями
@main.before_app_first_request
def init_databse():
    # Создание таблиц, если они не существует
    db.create_all(app=current_app)

    if not User.query.first():
        print("Create default user")
        new_user = User(
            username=current_app.config["TUNA_ADMIN_USER"],
            password=generate_password_hash(
                current_app.config["TUNA_ADMIN_PASS"], method='sha256'
            )
        )
        db.session.add(new_user)
        db.session.commit()

    if not Tone.query.first():
        print("Create tones")
        default_tone = Tone(
            tone="unknown"
        )
        db.session.add(default_tone)

        for tone_name in tone_strings:
            new_tone = Tone(
                tone=tone_name
            )
            db.session.add(new_tone)

        db.session.commit()
