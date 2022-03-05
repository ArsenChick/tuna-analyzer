from app.models import User
from app.models import Tone
from app.models import Result
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


def test_tone(app):
    db.init_app(app)
    db.create_all()

    tone1 = Tone(
        tone="test"
    )

    db.session.add(tone1)
    db.session.commit()

    get_tone1 = Tone.query.filter_by(tone='test').first()

    assert tone1.id == get_tone1.id
    assert tone1.tone == get_tone1.tone


def test_result(app):
    db.init_app(app)
    db.create_all()

    user1 = User(
        username="user1",
        password="pass1"
    )

    tone1 = Tone(
        tone="test"
    )

    db.session.add(tone1)
    db.session.add(user1)
    db.session.commit()

    result1 = Result(
        bpm=228,
        idTone=tone1.id,
        dance=10,
        energy=10,
        happiness=10,
        version=1,
        date=None,
        idUser=user1.id,
        file="bez_nazvania.mp3",
        isDeleted=0
    )

    db.session.add(result1)
    db.session.commit()

    get_result1 = Result.query.filter_by(bpm=228).first()
    get_tone = Tone.query.filter_by(id=get_result1.idTone).first()

    assert result1.id == get_result1.id
    assert tone1.id == get_result1.idTone
    assert user1.id == get_result1.idUser
    assert tone1.tone == get_tone.tone
