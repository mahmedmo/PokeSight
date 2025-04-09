# Filename: main.py
# Created on: Mon Apr 7th, 2025
# Created by: mahmedmo

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=False)