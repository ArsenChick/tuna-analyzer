## @package app.auth
#  Авторизация пользователя
#
#  Эндпоинты для входа, регистрации и выхода пользователя

from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from flask_jwt_extended import create_access_token, unset_jwt_cookies
from werkzeug.security import check_password_hash, generate_password_hash

from . import db
from .models import User

## "Чертёж" Flask
auth = Blueprint('auth', __name__)

## Функция для входа пользователя
#
#  Обрабатывает форму для входа.
#  Метод POST.
@auth.route('/api/login', methods=['POST'])
@cross_origin()
def login():
    json_data: dict = request.get_json()

    if json_data == None:
        return {'msg': 'Missing JSON'}, 401

    username = json_data.get('username', None)
    password = json_data.get('password', None)
    remember = True if json_data.get('remember', None) else False

    if username == None:
        return {'msg': 'Missing username'}, 422

    if password == None:
        return {'msg': 'Missing password'}, 422

    user: User = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return {'msg': 'Invalid username or password'}, 401

    access_token = create_access_token(identity=username)

    return {'access_token': access_token}, 200

## Функция регистрации пользователя
#
#  Обрабатывает форму для регистрации.
#  Метод POST.
@auth.route('/api/signup', methods=['POST'])
@cross_origin()
def signup():
    json_data: dict = request.get_json()

    if json_data == None:
        return {'msg': 'Missing JSON'}, 400

    username = json_data.get('username')
    password = json_data.get('password')
    password_confirm = json_data.get('password_confirm')

    if username == None:
        return {'msg': 'Missing username'}, 422

    if password == None:
        return {'msg': 'Missing password'}, 422

    if password_confirm == None:
        return {'msg': 'Missing password confirm'}, 422

    if password != password_confirm:
        return {'msg': 'Passwords doesn\'t match'}, 401

    user = User.query.filter_by(username=username).first()

    # Пользователь уже существует, нельзя создать нового
    if user:
        return {'msg': 'user already exists'}, 401

    # Создаем нового пользователя
    # Имя сохраняем как есть
    # Пароль сохраняем в виде хэша с солью
    new_user = User(
        username=username,
        password=generate_password_hash(password, method='sha256')
    )

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=username)

    return {'access_token': access_token}, 200


## Функция для выхода пользователя
#
#  Обрабатывает запрос на выход из системы.
#  Метод GET.
@auth.route('/api/logout', methods=['GET'])
@cross_origin()
def logout():
    response = jsonify({"msg": "Logout ok"})
    unset_jwt_cookies(response)
    return response
