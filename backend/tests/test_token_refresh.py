from os import access
from flask import url_for
from time import sleep

test_username = 'test_user'
test_password = 'test_pass'

def test_refresh(client):
    response = client.post(
        url_for('auth.signup'),
        json={
            'username': test_username,
            'password': test_password,
            'password_confirm': test_password
        }
    )

    assert response.status_code == 200
    assert response.json.get('access_token') != None

    token = response.json.get('access_token')

    # Ждём больше дельты обновления токена
    sleep(3)

    response = client.get(
        url_for('data.get_file'),
        query_string = {
            'id': -1
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 404
    assert response.json.get('msg') != None
    assert response.json.get('new_access_token') != None

def test_refresh_no_need_to_refresh(client):
    response = client.post(
        url_for('auth.signup'),
        json={
            'username': test_username,
            'password': test_password,
            'password_confirm': test_password
        }
    )

    assert response.status_code == 200
    assert response.json.get('access_token') != None

    token = response.json.get('access_token')

    response = client.get(
        url_for('data.get_file'),
        query_string = {
            'id': -1
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 404
    assert response.json.get('msg') != None
    assert response.json.get('new_access_token') == None