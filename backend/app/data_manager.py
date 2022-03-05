## @package app.data_manager
#  Управление дынными
#
#  Сохранение и отправка файлов, валидация формата
#  Сохранение и отправка результатов анализа

from flask import Blueprint, flash, redirect, render_template, request, url_for
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import jwt_required

from . import db
from .models import User

## "Чертёж" Flask
file_manager = Blueprint('files', __name__)

@file_manager.route('/save_results', methods=['POST'])
@jwt_required()
def save_results():
    return {"msg": "test"}

@file_manager.route('/get_saves', methods=['GET'])
@jwt_required()
def get_saves_ids():
    return {"msg": "test"}

@file_manager.route('/get_files', methods=['GET'])
@jwt_required()
def get_file():
    return {"msg": "test"}

@file_manager.route('/get_result', methods=['GET'])
@jwt_required()
def get_result():
    return {"msg": "test"}
