from flask import url_for

def test_home(client):
    # ок
    assert client.get(url_for('main.index')).status_code == 200
