from flask import Blueprint, render_template, request
import pandas as pd
from model.predictor import predict_winner
from model.pokemon_utils import get_image_url

bp = Blueprint("main", __name__)

pokemon_df = pd.read_csv("data/pokemon.csv")

@bp.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@bp.route("/predict", methods=["POST"])
def predict():
    p1_name = request.form["pokemon1"]
    p2_name = request.form["pokemon2"]
    pred, _ = predict_winner(p1_name, p2_name, pokemon_df)

    if pred is None:
        error = "Invalid Pokémon name(s)."
        return render_template("partials/result.html", error=error)

    winner = "p1" if pred == 1 else "p2"
    result = f"{p1_name if winner == 'p1' else p2_name} is predicted to win!"
    p1_img = get_image_url(p1_name)
    p2_img = get_image_url(p2_name)

    return render_template(
        "partials/result.html",
        result=result,
        winner=winner,
        p1_img=p1_img,
        p2_img=p2_img,
        p1_name=p1_name,
        p2_name=p2_name,
    )
