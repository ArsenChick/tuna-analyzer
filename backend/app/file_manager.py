## @package app.file_manger
#  Управление файлами
#
#  Сохранение и отправка файлов, валидация формата

from flask import Blueprint, flash, redirect, render_template, request, url_for
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import jwt_required

from . import db
from .models import User

## "Чертёж" Flask
file_manager = Blueprint('files', __name__)

@file_manager.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    return {"msg": "test"}
