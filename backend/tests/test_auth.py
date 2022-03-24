from flask import url_for

test_username = 'test_user'
test_password = 'test_pass'

## Полуение пути из URL
#
# http://example.com/path?arg=42 --> /path
def cut_endpoint(location: str):
    location_endpoint = location.split('/')[-1]
    location_endpoint = location_endpoint.split('?')[0]
    return location_endpoint


def test_signup_post(client):
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

def test_signup_get(client):
    response = client.get(url_for('auth.signup'))

    assert response.status_code == 404

def test_signup_post_empty(client):
    response = client.post(url_for('auth.signup'))

    assert response.status_code == 400
    assert response.json.get('msg') != None

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': None,
            'password': test_password,
            'password_confirm': test_password
        }
    )

    assert response.status_code == 422
    assert response.json.get('msg') != None

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': test_username,
            'password': None,
            'password_confirm': test_password
        }
    )

    assert response.status_code == 422
    assert response.json.get('msg') != None

    response = client.post(
        url_for('auth.signup'),
        json={
            'username': test_username,
            'password': test_password,
            'password_confirm': None
        }
    )

    assert response.status_code == 422
    assert response.json.get('msg') != None


def test_signup_post_username_already_exists(client):
    client.post(
        url_for('auth.signup'),
        json={
            'username': test_username,
            'password': test_password,
            'password_confirm': test_password
        }
    )
    response = client.post(
        url_for('auth.signup'),
        json={
            'username': test_username,
            'password': 'test_password1',
            'password_confirm': 'test_password1'
        }
    )

    assert response.status_code == 401
    assert response.json.get('msg') != None

def test_signup_post_wrong_confirm(client):
    response = client.post(
        url_for('auth.signup'),
        json={
            'username': test_username,
            'password': test_password,
            'password_confirm': 'wrong_password'
        }
    )

    assert response.status_code == 401
    assert response.json.get('msg') != None


def test_login_post(client):
    response = client.post(url_for('auth.login'))

    assert response.status_code == 401
    assert response.json.get('msg') != None

    client.post(
        url_for('auth.signup'),
        json={
            'username': test_username,
            'password': test_password,
            'password_confirm': test_password
        }
    )
    response = client.post(
        url_for('auth.login'),
        json={
            'username': test_username,
            'password': test_password,
        }
    )

    assert response.status_code == 200
    assert response.json.get('access_token') != None

def test_login_get(client):
    response = client.get(url_for('auth.login'))

    assert response.status_code == 404

def test_login_post_empty(client):
    response = client.post(
        url_for('auth.login'),
        json={
            'username': None,
            'password': test_password,
        }
    )

    assert response.status_code == 422
    assert response.json.get('msg') != None

    response = client.post(
        url_for('auth.login'),
        json={
            'username': test_username,
            'password': None,
        }
    )

    assert response.status_code == 422
    assert response.json.get('msg') != None


def test_login_post_wrong_username(client):
    client.post(
        url_for('auth.signup'),
        json={
            'username': test_username,
            'password': test_password,
            'password_confirm': test_password
        }
    )
    response = client.post(
        url_for('auth.login'),
        json={
            'username': 'wrong_username',
            'password': test_password,
        }
    )

    assert response.status_code == 401
    assert response.json.get('msg') != None

def test_login_post_wrong_password(client):
    client.post(
        url_for('auth.signup'),
        json={
            'username': test_username,
            'password': test_password,
            'password_confirm': test_password
        }
    )

    response = client.post(
        url_for('auth.login'),
        json={
            'username': test_username,
            'password': 'wrong_password',
        }
    )

    assert response.status_code == 401
    assert response.json.get('msg') != None

def test_login_post_no_such_user(client):

    response = client.post(
        url_for('auth.login'),
        json={
            'username': test_username,
            'password': test_password,
        }
    )

    assert response.status_code == 401
    assert response.json.get('msg') != None

def test_logout(client):
    client.post(
        url_for('auth.signup'),
        json={
            'username': test_username,
            'password': test_password,
            'password_confirm': test_password
        }
    )
    response = client.post(
        url_for('auth.login'),
        json={
            'username': test_username,
            'password': test_password,
        }
    )
    response = client.get(url_for('auth.logout'))

    assert response.json.get('msg') != None
