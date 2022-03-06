## @package app.data_manager
#  Управление дынными
#
#  Сохранение и отправка файлов, валидация формата
#  Сохранение и отправка результатов анализа

from fileinput import filename
from unittest import result
from urllib import response
from flask import Blueprint, flash, redirect, render_template, request, url_for, current_app
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import os
from uuid import uuid4
import json
import base64

from . import db
from .models import User, Result, Tone

## "Чертёж" Flask
data_manager = Blueprint('data', __name__)

## Разрешенные расширения файлов
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'flac'}

## Проверяет расширение файла
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@data_manager.route('/save_results', methods=['POST'])
@jwt_required()
def save_results():
    json_data: dict = request.get_json()

    if json_data == None:
        return {'msg': 'Invalid JSON data'}, 422

    bpm: int = json_data.get("bpm", 0)
    idTone: int = json_data.get("idTone", 1)
    dance: int = json_data.get("dance", 0)
    energy: int = json_data.get("energy", 0)
    happiness: int = json_data.get("happiness", 0)
    version: int = json_data.get("version", 0)
    upload_date = datetime.now()

    current_username: str = get_jwt_identity()
    user: User = User.query.filter_by(username=current_username).first()
    idUser = user.id

    file_info = json_data.get("file", None)
    if file_info == None:
        return {'msg': 'No selected file'}, 422

    filename = file_info.get("filename", None)
    file_data = file_info.get("content", None)

    if filename == None or file_data == None:
        return {'msg': 'Missing file data'}, 422

    try:
        file_data = base64.b64decode(file_data)
    except:
        return {'msg': 'Can\'t decode file'}, 422

    if allowed_file(filename):
        filename = secure_filename(str(uuid4()) + '-' + filename)
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        with open(file_path, 'wb') as file:
            file.write(file_data)
    else:
        return {'msg': 'Invalid file'}, 422

    result = Result(
        bpm=bpm,
        idTone=idTone,
        dance=dance,
        energy=energy,
        happiness=happiness,
        version=version,
        date=upload_date,
        idUser=idUser,
        file=file_path,
        isDeleted=False
    )

    db.session.add(result)
    db.session.commit()

    return {'msg': 'Upload done'}, 200

@ data_manager.route('/get_saves', methods=['GET'])
@ jwt_required()
def get_saves_ids():
    return {"msg": "test"}

@ data_manager.route('/get_file', methods=['GET'])
@ jwt_required()
def get_file():
    return {"msg": "test"}

@ data_manager.route('/get_result', methods=['GET'])
@ jwt_required()
def get_result():
    return {"msg": "test"}