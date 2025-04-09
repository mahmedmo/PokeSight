# Filename: app/data_cache.py
# Created on: Tues Apr 8th, 2025
# Created by: mahmedmo

import pandas as pd
from app import cache

@cache.cached(timeout=86400, key_prefix='pokemon_df')
def get_pokemon_df():
    return pd.read_csv("data/pokemon.csv")