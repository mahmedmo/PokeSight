# Filename: routes.py
# Created on: Mon Apr 7th, 2025
# Created by: mahmedmo

from flask import Blueprint, render_template, request, jsonify
import pandas as pd
from model.predictor import predict_winner, predict_possibilities
from model.poke_utils import get_image_url

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
    p1_img = get_image_url(p1_name)
    p2_img = get_image_url(p2_name)

    p1_prob, p2_prob = predict_possibilities(p1_name, p2_name, pokemon_df)

    if p1_prob is None or p2_prob is None:
        error = "Error computing prediction probabilities."
        return render_template("partials/result.html", error=error)

    return render_template(
        "partials/result.html",
        winner=winner,
        p1_img=p1_img,
        p2_img=p2_img,
        p1_name=p1_name,
        p2_name=p2_name,
        p1_prob=p1_prob,
        p2_prob=p2_prob
    )

@bp.route("/get_pokemon_image", methods=["GET"])
def get_pokemon_image():
    name = request.args.get("name", "").strip()
    if not name:
        return jsonify({"error": "No Pokémon name provided."}), 400

    valid_names = pokemon_df['Name'].tolist()
    if name.capitalize() not in valid_names:
        return jsonify({"error": "Invalid Pokémon name."}), 404

    image_url = get_image_url(name)
    if not image_url:
        return jsonify({"error": "Could not retrieve image."}), 404

    return jsonify({"image_url": image_url})