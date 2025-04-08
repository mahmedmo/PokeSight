import joblib
import pandas as pd
from model.pokemon_utils import get_pokemon_features

model = joblib.load("trained_model/model.pkl")

def predict_winner(p1_name, p2_name, pokemon_df):
    p1 = get_pokemon_features(p1_name, "p1", pokemon_df)
    p2 = get_pokemon_features(p2_name, "p2", pokemon_df)
    if p1 is None or p2 is None:
        return None, None
    features = {**p1, **p2, "p1_goes_first": 1}
    X = pd.DataFrame([features])
    pred = model.predict(X)[0]
    return pred, features
