## @package app.data_manager
#  Управление данными
#
#  Сохранение и отправка файлов, валидация формата
#  Сохранение и отправка результатов анализа

from fileinput import filename
from unittest import result
from urllib import response
from flask import Blueprint, flash, redirect, render_template, request, url_for, current_app, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import desc, func
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

## Функция сохранения результата
#
#  Сохраняет полученные результаты анализа и аудиофайл.
#  Метод POST.
@data_manager.route('/api/save_results', methods=['POST'])
@jwt_required()
def save_results():
    json_data: dict = request.get_json()

    if json_data == None:
        return {'msg': 'Invalid JSON data'}, 422

    bpm: int = json_data.get("bpm", 0)
    # idTone: int = json_data.get("idTone", 1)
    tone_name: str = json_data.get("tone", None)
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

    if tone_name is None:
        return {'msg': f'Tone is empty'}, 422

    tone = Tone.query.filter_by(tone=tone_name).first()

    if tone is None:
        return {'msg': f'Invalid tone'}, 422

    result = Result(
        bpm=bpm,
        idTone=tone.id,
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


## Функция получения информации о сохраненных результатах анализа.
#
#  Отправляет все идентификаторы сохраненных результатов анализов пользователя.
#  Метод GET.
@data_manager.route('/api/get_saves', methods=['GET'])
@jwt_required()
def get_saves_ids():
    current_username: str = get_jwt_identity()
    user: User = User.query.filter_by(username=current_username).first()
    current_idUser = user.id
    search_by = request.args.get("sort")
    after = request.args.get("from")
    until = request.args.get("until")
    if after == None:
        after = "2000-01-01"
    if until == None:
        until = "3000-12-31"
    else:
        until_date = datetime.strptime(until, "%Y-%m-%d")
        until_date = until_date + timedelta(days=1)
        until = until_date.strftime("%Y-%m-%d")
    if search_by == None:
        results = Result.query.filter(
            Result.date >= after,
            Result.date <= until
        ).filter_by(
            idUser=current_idUser,
            isDeleted=False
        ).with_entities(Result.id).all()
    elif search_by == "file":
        results = Result.query.filter(
            Result.date >= after,
            Result.date <= until
        ).filter_by(
            idUser=current_idUser,
            isDeleted=False
        ).order_by(func.substr(Result.file, len(current_app.config['UPLOAD_FOLDER']) + 39).desc()
        ).with_entities(Result.id).all()
    else:
        results = Result.query.filter(
            Result.date >= after,
            Result.date <= until
        ).filter_by(
            idUser=current_idUser,
            isDeleted=False
        ).order_by(getattr(Result, search_by).desc()).with_entities(Result.id).all()
    ids = [id[0] for id in results]
    order = request.args.get("order")
    if order == "asc":
        ids.reverse()
        return {
            "msg": "Request done",
            "ids": ids,
        }, 200
    else:
        return {
            "msg": "Request done",
            "ids": ids,
        }, 200
    

## Функция получения загруженного аудиофайла.
#
#  Отправляет ранее сохраненный аудиофайл по его идентификатору.
#  Метод GET.
@data_manager.route('/api/get_file', methods=['GET'])
@jwt_required()
def get_file():
    id_res = request.args.get("id")
    if id_res == None:
        return {'msg': 'No id'}, 422
    result: Result = Result.query.filter_by(id=id_res).first()
    if result == None:
        return {'msg': 'No such entry'}, 404
    file_path = result.file
    f = open(file_path, 'rb')
    file_content = base64.b64encode(f.read()).decode('utf-8')
    f.close()
    file_name = os.path.basename(result.file)
    return {
        "msg": "Request done",
            "file": {
                "filename": file_name,
                "content": file_content
            }
    }, 200

## Функция получения имени загруженного аудиофайла.
#
#  Отправляет имя ранее сохраненного аудиофайла по его идентификатору.
#  Метод GET.
@data_manager.route('/api/get_file_name', methods=['GET'])
@jwt_required()
def get_file_name():
    id_res = request.args.get("id")
    if id_res == None:
        return {'msg': 'No id'}, 422
    result: Result = Result.query.filter_by(id=id_res).first()
    if result == None:
        return {'msg': 'No such entry'}, 404

    file_name = os.path.basename(result.file)
    return {
        "msg": "Request done",
        "filename": file_name
    }, 200


## Функция получения результатов анализа.
#
#  Отправляет ранее сохраненные результаты анализа по их идентификатору.
#  Метод GET.
@data_manager.route('/api/get_result', methods=['GET'])
@jwt_required()
def get_result():
    idRes = request.args.get("id", None)
    if idRes == None:
        return {'msg': 'No id'}, 422
    result: Result = Result.query.filter_by(id=idRes, isDeleted=False).first()
    if result == None:
        return {'msg': 'No such entry'}, 404
    tone: Tone = Tone.query.filter_by(id=result.idTone).first()
    file_name = os.path.basename(result.file)[37:]
    return {
        "msg": "Ok",
        "bpm": result.bpm,
        "tone": tone.tone,
        "dance": result.dance,
        "energy": result.energy,
        "happiness": result.happiness,
        "version": result.version,
        "filename": file_name,
        "date": result.date
    }, 200

## Функция получения результатов анализа.
#
#  Удаляет результаты анализа  по их идентификатору.
#  Метод DELETE.
@data_manager.route('/api/delete_result', methods=['DELETE'])
@jwt_required()
def delete_result():
    idRes = request.args.get("id", None)
    if idRes == None:
        return {'msg': 'No id'}, 422

    result: Result = Result.query.filter_by(id=idRes, isDeleted=False).first()
    if result == None:
        return {'msg': 'No such entry'}, 404

    result.isDeleted = True
    db.session.commit()

    return {
        'msg': 'Ok',
    }, 200
