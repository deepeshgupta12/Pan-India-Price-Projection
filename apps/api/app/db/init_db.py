from app.db.base import *  # noqa: F401,F403
from app.db.base_class import Base
from app.db.session import engine


def init_db() -> None:
    Base.metadata.create_all(bind=engine)