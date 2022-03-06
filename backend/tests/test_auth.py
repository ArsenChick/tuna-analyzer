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
        data={
            'username': test_username,
            'password': test_password,
            'password_confirm': test_password
        }
    )

    assert response.status_code == 200
<<<<<<< HEAD
=======
    assert response.json.get('access_token') != None
    
def test_signup_get(client):
    response = client.get(url_for('auth.signup'))

    assert response.status_code == 405

def test_signup_post_empty(client):
    response = client.post(url_for('auth.signup'))

    assert response.status_code == 400

def test_signup_post_username_already_exists(client):
    client.post(
        url_for('auth.signup'),
        data={
            'username': test_username,
            'password': test_password,
            'password_confirm': test_password
        }
    )
    response = client.post(
        url_for('auth.signup'),
        data={
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
        data={
            'username': test_username,
            'password': test_password,
            'password_confirm': 'wrong_password'
        }
    )

    assert response.status_code == 401
    assert response.json.get('msg') != None


def test_login_post(client):
    client.post(
        url_for('auth.signup'),
        data={
            'username': test_username,
            'password': test_password,
            'password_confirm': test_password
        }
    )
    response = client.post(
        url_for('auth.login'),
        data={
            'username': test_username,
            'password': test_password,
        }
    )

    assert response.status_code == 200
    assert response.json.get('access_token') != None

def test_login_get(client):
    response = client.get(url_for('auth.login'))

    assert response.status_code == 405
    
def test_login_post_empty(client):
    response = client.post(url_for('auth.login'))

    assert response.status_code == 401
    assert response.json.get('msg') != None
    

def test_login_post_wrong_username(client):
    client.post(
        url_for('auth.signup'),
        data={
            'username': test_username,
            'password': test_password,
            'password_confirm': test_password
        }
    )
    response = client.post(
        url_for('auth.login'),
        data={
            'username': 'wrong_username',
            'password': test_password,
        }
    )

    assert response.status_code == 401
    assert response.json.get('msg') != None
    
def test_login_post_wrong_password(client):
    client.post(
        url_for('auth.signup'),
        data={
            'username': test_username,
            'password': test_password,
            'password_confirm': test_password
        }
    )
    
    response = client.post(
        url_for('auth.login'),
        data={
            'username': test_username,
            'password': 'wrong_password',
        }
    )

    assert response.status_code == 401
    assert response.json.get('msg') != None
    
def test_login_post_no_such_user(client):

    response = client.post(
        url_for('auth.login'),
        data={
            'username': test_username,
            'password': test_password,
        }
    )

    assert response.status_code == 401
    assert response.json.get('msg') != None
>>>>>>> 58070cc5b3011bb20630042b13c2ee276ab68975
