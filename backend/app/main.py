## @package app.main
#  Основные страницы
#
#  Основные эндпоинты приложения

from flask import Blueprint, render_template, current_app, send_from_directory
from . import db
import os

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

## Возврщает файл из директории modules
@main.route('/modules/<path:path>')
def modules_file(path):
    return send_from_directory(os.path.join(current_app.root_path, 'modules'), path)
