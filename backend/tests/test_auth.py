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

## Пример тест
def test_demo(client):
    assert 1 == 1
