# Filename: __init__.py
# Created on: Mon Apr 7th, 2025
# Created by: mahmedmo

from flask import Flask, request
from flask_caching import Cache
from dotenv import load_dotenv

load_dotenv()
cache = Cache()


def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    cache.init_app(app)

    @app.after_request
    def add_cache_control(response):
        if request.path.startswith("/static/"):
            response.headers["Cache-Control"] = "public, max-age=31536000"
        return response

    from app.routes import bp as main_blueprint

    app.register_blueprint(main_blueprint)

    return app
