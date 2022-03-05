## @package app.conftest
#  Подготовка тестового окружения
#
#  Настраивает тестовое окружение для pytest

import pytest
from app import create_app

@pytest.fixture
def app():
    app = create_app('app.config.Test')
    return app
