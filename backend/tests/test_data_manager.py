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
        data={
            'username': 'user',
            'password': 'password',
            'password_confirm': 'password'
        }
    )

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

    assert response.status_code == 200
    assert 'msg' in response.json
    assert response.json['msg'] == 'Upload done'
