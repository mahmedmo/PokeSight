# Filename: routes.py
# Created on: Mon Apr 7th, 2025
# Created by: mahmedmo

from flask import Blueprint, render_template, request, jsonify
import pandas as pd
from model.poke_utils import get_image_url
from app import cache
from app.data_cache import get_pokemon_df

bp = Blueprint("main", __name__)
pokemon_df = get_pokemon_df()

@bp.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@bp.route("/predict", methods=["POST"])
def predict():
    p1_name = request.form["pokemon1"].strip().lower()
    p2_name = request.form["pokemon2"].strip().lower()
    
    cache_key = f"prediction:{p1_name}:{p2_name}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached
    
    cache_key = f"prediction:{p1_name}:{p2_name}"
    cached_prediction = cache.get(cache_key)
    if cached_prediction is not None:
        return cached_prediction

    from model.predictor import predict_winner, predict_possibilities
    from model.poke_utils import get_image_url

    pred, _ = predict_winner(p1_name, p2_name, pokemon_df)
    if pred is None:
        error = "Invalid Pokémon name(s)."
        result_html = render_template("partials/result.html", error=error)
        return result_html

    winner = "p1" if pred == 1 else "p2"
    p1_img = get_image_url(p1_name)
    p2_img = get_image_url(p2_name)

    p1_prob, p2_prob = predict_possibilities(p1_name, p2_name, pokemon_df)
    if p1_prob is None or p2_prob is None:
        error = "Error computing prediction probabilities."
        result_html = render_template("partials/result.html", error=error)
        return result_html

    result_html = render_template(
        "partials/result.html",
        winner=winner,
        p1_img=p1_img,
        p2_img=p2_img,
        p1_name=p1_name,
        p2_name=p2_name,
        p1_prob=p1_prob,
        p2_prob=p2_prob,
    )

    cache.set(cache_key, result_html, timeout=3600)
    return result_html


@bp.route("/get_pokemon_image", methods=["GET"])
@cache.cached(timeout=86400, query_string=True)
def get_pokemon_image():
    name = request.args.get("name", "").strip()
    if not name:
        return jsonify({"error": "No Pokémon name provided."}), 400

    valid_names = pokemon_df["Name"].tolist()
    if name.capitalize() not in valid_names:
        return jsonify({"error": "Invalid Pokémon name."}), 404

    image_url = get_image_url(name)
    if not image_url:
        return jsonify({"error": "Could not retrieve image."}), 404

    return jsonify({"image_url": image_url})
