## @package app.data_manager
#  Управление дынными
#
#  Сохранение и отправка файлов, валидация формата
#  Сохранение и отправка результатов анализа

from distutils.command.upload import upload
from fileinput import filename
from unittest import result
from flask import Blueprint, flash, redirect, render_template, request, url_for, current_app
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import os
from uuid import uuid4

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
    bpm: int = request.form.get("bpm", default=0)
    idTone: int = request.form.get("idTone", default=1)
    dance: int = request.form.get("dance", default=0)
    energy: int = request.form.get("energy", default=0)
    happiness: int = request.form.get("happiness", default=0)
    version: int = request.form.get("version", default=0)
    upload_date = datetime.now()

    current_username: str = get_jwt_identity()
    user: User = User.query.filter_by(username=current_username).first()
    idUser = user.id

    if 'file' not in request.files:
        return {'msg': 'No file part'}, 422

    file = request.files['file']

    if file.filename == '':
        return {'msg': 'No selected file'}, 422

    if file and allowed_file(file.filename):
        filename = secure_filename(str(uuid4()) + '-' + file.filename)
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
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
