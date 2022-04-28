import json
from flask import url_for
import tempfile
import base64
import random

def test_mp3_file(client):
    random_data = random.randbytes(1024)
    b64_data = base64.b64encode(random_data).decode()

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.post(
        url_for('data.save_results'),
        json={
            'bpm': 128,
            'tone': 'F major',
            'dance': 42,
            'energy': 42,
            'happiness': 42,
            'version': 42,
            'file': {
                'filename': 'file.mp3',
                'content': b64_data
            }
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 200
    assert 'msg' in response.json
    assert response.json['msg'] == 'Upload done'

def test_save_results_no_json(client):
    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.post(url_for('data.save_results'),
                           headers={
        'Authorization': "Bearer " + token
    })

    assert response.status_code == 422
    assert 'msg' in response.json

def test_save_results_no_auth(client):
    random_data = random.randbytes(1024)
    b64_data = base64.b64encode(random_data).decode()

    response = client.post(
        url_for('data.save_results'),
        json={
            'bpm': 128,
            'idTone': 0,
            'dance': 42,
            'energy': 42,
            'happiness': 42,
            'version': 42,
            'file': {
                'filename': 'file.mp3',
                'content': b64_data
            }
        })

    assert response.status_code == 401
    assert 'msg' in response.json

def test_save_results_no_filename(client):
    random_data = random.randbytes(1024)
    b64_data = base64.b64encode(random_data).decode()

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.post(
        url_for('data.save_results'),
        json={
            'bpm': 128,
            'idTone': 0,
            'dance': 42,
            'energy': 42,
            'happiness': 42,
            'version': 42,
            'file': {
                'content': b64_data
            }
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 422
    assert 'msg' in response.json

def test_save_results_no_file_content(client):
    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.post(
        url_for('data.save_results'),
        json={
            'bpm': 128,
            'idTone': 0,
            'dance': 42,
            'energy': 42,
            'happiness': 42,
            'version': 42,
            'file': {
                'filename': 'file.mp3'
            }
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 422
    assert 'msg' in response.json

def test_save_results_no_file(client):

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.post(
        url_for('data.save_results'),
        json={
            'bpm': 128,
            'idTone': 0,
            'dance': 42,
            'energy': 42,
            'happiness': 42,
            'version': 42
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 422
    assert 'msg' in response.json

def test_save_results_bad_b64(client):
    random_data = random.randbytes(1024)
    b64_data = base64.b64encode(random_data).decode()
    d = list(b64_data)
    d[10] = 'ы'
    b64_data = "".join(d)

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.post(
        url_for('data.save_results'),
        json={
            'bpm': 128,
            'idTone': 0,
            'dance': 42,
            'energy': 42,
            'happiness': 42,
            'version': 42,
            'file': {
                'filename': 'file.mp3',
                'content': b64_data
            }
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 422
    assert 'msg' in response.json

def test_save_results_wrong_format(client):
    random_data = random.randbytes(1024)
    b64_data = base64.b64encode(random_data).decode()

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.post(
        url_for('data.save_results'),
        json={
            'bpm': 128,
            'idTone': 0,
            'dance': 42,
            'energy': 42,
            'happiness': 42,
            'version': 42,
            'file': {
                'filename': 'file.bmp',
                'content': b64_data
            }
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 422
    assert 'msg' in response.json

def test_save_results_get(client):
    response = client.get(url_for('data.save_results'))

    assert response.status_code == 200


def test_get_saves_ids(client):
    random_data = random.randbytes(1024)
    b64_data = base64.b64encode(random_data).decode()

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.post(
        url_for('data.save_results'),
        json={
            'bpm': 128,
            'tone': 'F major',
            'dance': 42,
            'energy': 42,
            'happiness': 42,
            'version': 42,
            'file': {
                'filename': 'file.mp3',
                'content': b64_data
            }
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 200
    assert 'msg' in response.json

    response = client.get(
        url_for('data.get_saves_ids'),
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 200
    assert 'msg' in response.json
    assert response.json['ids'][0] == 1


def test_get_saves_ids_post(client):
    response = client.post(url_for('data.get_saves_ids'))

    assert response.status_code == 405

def test_get_saves_ids_no_auth(client):

    response = client.get(url_for('data.get_saves_ids'))

    assert response.status_code == 401
    assert 'msg' in response.json


def test_get_saves_ids_empty_id_list(client):

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.get(
        url_for('data.get_saves_ids'),
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 200
    assert 'msg' in response.json
    assert response.json['ids'] == []


def test_get_file(client):
    random_data = random.randbytes(1024)
    b64_data = base64.b64encode(random_data).decode()

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.post(
        url_for('data.save_results'),
        json={
            'bpm': 128,
            'tone': 'F major',
            'dance': 42,
            'energy': 42,
            'happiness': 42,
            'version': 42,
            'file': {
                'filename': 'file.mp3',
                'content': b64_data
            }
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 200
    assert 'msg' in response.json

    response = client.get(
        url_for('data.get_file'),
        query_string={
            'id': 1
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 200
    assert 'msg' in response.json
    assert 'file' in response.json


def test_get_file_no_id(client):

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.get(
        url_for('data.get_file'),
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 422
    assert 'msg' in response.json


def test_get_file_no_such_entry(client):

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.get(
        url_for('data.get_file'),
        query_string={
            'id': 1
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 404
    assert 'msg' in response.json


def test_get_file_no_auth(client):
    response = client.get(
        url_for('data.get_file'),
        query_string={
            'id': 1
        }
    )

    assert response.status_code == 401
    assert 'msg' in response.json

def test_get_file_post(client):
    response = client.post(url_for('data.get_file'))

    assert response.status_code == 405


def test_get_result(client):
    random_data = random.randbytes(1024)
    b64_data = base64.b64encode(random_data).decode()

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.post(
        url_for('data.save_results'),
        json={
            'bpm': 128,
            'tone': 'F major',
            'dance': 42,
            'energy': 42,
            'happiness': 42,
            'version': 42,
            'file': {
                'filename': 'file.mp3',
                'content': b64_data
            }
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 200
    assert 'msg' in response.json

    response = client.get(
        url_for('data.get_result'),
        query_string={
            'id': 1
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 200
    assert 'msg' in response.json
    assert 'bpm' in response.json
    assert response.json['dance'] == 42


def test_get_result_no_id(client):
    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.get(
        url_for('data.get_result'),
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 422
    assert 'msg' in response.json


def test_get_result_no_such_entry(client):
    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.get(
        url_for('data.get_result'),
        query_string={
            'id': 1
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 404
    assert 'msg' in response.json


def test_get_result_no_auth(client):
    response = client.get(
        url_for('data.get_result'),
        query_string={
            'id': 1
        }
    )

    assert response.status_code == 401
    assert 'msg' in response.json

def test_get_result_post(client):
    response = client.post(url_for('data.get_result'))

    assert response.status_code == 405

def test_delete_result(client):
    random_data = random.randbytes(1024)
    b64_data = base64.b64encode(random_data).decode()

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.post(
        url_for('data.save_results'),
        json={
            'bpm': 128,
            'tone': 'F major',
            'dance': 42,
            'energy': 42,
            'happiness': 42,
            'version': 42,
            'file': {
                'filename': 'file.mp3',
                'content': b64_data
            }
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 200
    assert 'msg' in response.json

    response = client.delete(
        url_for('data.delete_result'),
        query_string={
            'id': 1
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 200
    assert 'msg' in response.json

    response = client.get(
        url_for('data.get_result'),
        query_string={
            'id': 1
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 404

def test_double_delete_result(client):
    random_data = random.randbytes(1024)
    b64_data = base64.b64encode(random_data).decode()

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.post(
        url_for('data.save_results'),
        json={
            'bpm': 128,
            'tone': 'F major',
            'dance': 42,
            'energy': 42,
            'happiness': 42,
            'version': 42,
            'file': {
                'filename': 'file.mp3',
                'content': b64_data
            }
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 200
    assert 'msg' in response.json

    response = client.delete(
        url_for('data.delete_result'),
        query_string={
            'id': 1
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 200
    assert 'msg' in response.json

    response = client.delete(
        url_for('data.delete_result'),
        query_string={
            'id': 1
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 404

def test_noid_delete_result(client):
    random_data = random.randbytes(1024)
    b64_data = base64.b64encode(random_data).decode()

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

    assert response.status_code == 200
    token = response.json['access_token']

    response = client.post(
        url_for('data.save_results'),
        json={
            'bpm': 128,
            'tone': 'F major',
            'dance': 42,
            'energy': 42,
            'happiness': 42,
            'version': 42,
            'file': {
                'filename': 'file.mp3',
                'content': b64_data
            }
        },
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 200
    assert 'msg' in response.json

    response = client.delete(
        url_for('data.delete_result'),
        headers={
            'Authorization': "Bearer " + token
        }
    )

    assert response.status_code == 422
