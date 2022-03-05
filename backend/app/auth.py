## @package app.auth
#  Авторизация пользователя
#
#  Эндпоинты для входа, регистрации и выхода пользователя

from flask import Blueprint, jsonify, request
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
@auth.route('/login', methods=['POST'])
def login_post():
    username = request.form.get('username')
    password = request.form.get('password')
    remember = True if request.form.get('remember') else False

    user: User = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return {'msg': 'Invalid username or password'}, 401

    access_token = create_access_token(identity=username)

    return {'access_token': access_token}, 200

## Функция регистрации пользователя
#
#  Обрабатывает форму для регистрации.
#  Метод POST.
@auth.route('/signup', methods=['POST'])
def signup_post():
    username = request.form.get('username')
    password = request.form.get('password')
    password_confirm = request.form.get('password_confirm')

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
@auth.route('/logout', methods=['GET'])
def logout():
    response = jsonify({"msg": "Logout ok"})
    unset_jwt_cookies(response)
    return response
