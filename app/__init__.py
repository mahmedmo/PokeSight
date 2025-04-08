# Filename: __init__.py
# Created on: Mon Apr 7th, 2025
# Created by: mahmedmo

from flask import Flask

def create_app():
    app = Flask(__name__)
    
    from app.routes import bp as main_blueprint
    app.register_blueprint(main_blueprint)
    
    return app