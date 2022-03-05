from app.models import User
from app import db

def test_user(app):
    db.init_app(app)
    db.create_all()

    user1 = User(
        username="user1",
        password="pass1"
    )

    db.session.add(user1)
    db.session.commit()

    get_user1 = User.query.filter_by(username='user1').first()

    assert user1.id == get_user1.id
    assert user1.password == get_user1.password
