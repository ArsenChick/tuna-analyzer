## @package app.main
#  Основные страницы
#
#  Основные эндпоинты приложения

from flask import Blueprint, render_template, current_app
from . import db

main = Blueprint('main', __name__)

## Возвращает основной файл React приложения
@main.route('/')
def index():
    return render_template('index.html')

## Возврщает статичный файл из директории static
@main.route('/<path:path>')
def static_file(path):
    return current_app.send_static_file(path)

## Возврщает файл из директории workers
@main.route('/workers/<path:path>')
def static_file(path):
    return current_app.send_static_file(path)
