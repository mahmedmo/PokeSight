# Filename: app/config.py
# Created on: Tues Apr 8th, 2025
# Created by: mahmedmo

import os
from urllib.parse import urlparse

class Config:
    DEBUG = os.getenv('FLASK_DEBUG', False)
    TESTING = os.getenv('FLASK_TESTING', False)
    
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        parsed_url = urlparse(redis_url)
        CACHE_REDIS_HOST = parsed_url.hostname
        CACHE_REDIS_PORT = parsed_url.port
        CACHE_REDIS_PASSWORD = parsed_url.password
        CACHE_REDIS_DB = 0
    
    CACHE_TYPE = "RedisCache"
    CACHE_DEFAULT_TIMEOUT = int(os.getenv("CACHE_DEFAULT_TIMEOUT", 3600))