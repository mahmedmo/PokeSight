# Filename: train_model.py
# Created on: Mon Apr 7th, 2025
# Created by: wzhengy

import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
import joblib

def train_model():
    combats = pd.read_csv("data/combats.csv")
    pokemon_stats = pd.read_csv("data/pokemon.csv")

    for col in ["Legendary"]:
        pokemon_stats[col] = pokemon_stats[col].astype(int)
    pokemon_stats["Type2"] = pokemon_stats["Type2"].fillna("None")

    p1 = pokemon_stats.add_prefix("p1_")
    p2 = pokemon_stats.add_prefix("p2_")
    data = combats.merge(p1, left_on="First_pokemon", right_on="p1_#", how="left")
    data = data.merge(p2, left_on="Second_pokemon", right_on="p2_#", how="left")
    data["p1_goes_first"] = (data["First_pokemon"] == data["p1_#"]).astype(
        int
    )  # to show which Pokemon goes first, instead of having both First_pokemon and Second_pokemon

    y = (data["Winner"] == data["First_pokemon"]).astype(
        int
    )  # 1 if the first Pokemon won, 0 if the second Pokemon won
    X = data.drop(
        columns=[
            "First_pokemon",
            "Second_pokemon",
            "Winner",
            "p1_#",
            "p2_#",
            "p1_Name",
            "p2_Name",
        ]
    )  # Don't need the ids or names of the Pokemon, also don't want the target feature

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, random_state=0, test_size=0.2
    )

    model_gb = GradientBoostingClassifier()

    num_cols = [
        "p1_HP",
        "p1_Attack",
        "p1_Defense",
        "p1_SpAtk",
        "p1_SpDef",
        "p1_Speed",
        "p2_HP",
        "p2_Attack",
        "p2_Defense",
        "p2_SpAtk",
        "p2_SpDef",
        "p2_Speed",
        "p1_Legendary",
        "p2_Legendary",
        "p1_goes_first",
    ]

    cat_cols = [
        "p1_Type1",
        "p1_Type2",
        "p2_Type1",
        "p2_Type2",
        "p1_Generation",
        "p2_Generation",
    ]

    ct = ColumnTransformer(
        [
            ("scaling", StandardScaler(), num_cols),
            (
                "encoding",
                OneHotEncoder(sparse_output=False, handle_unknown="ignore"),
                cat_cols,
            ),
        ]
    )

    pipe_gb = Pipeline([("prep", ct), ("model", model_gb)])

    pipe_gb.fit(X_train, y_train)
    model = pipe_gb

    joblib.dump(model, "trained_model/model.pkl")


if __name__ == "__main__":
    train_model()
