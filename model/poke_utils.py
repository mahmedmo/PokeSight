# Filename: poke_utils.py
# Created on: Mon Apr 7th, 2025
# Created by: mahmedmo

import pandas as pd


def get_pokemon_features(name, prefix, df):
    row = df[df["Name"].str.lower() == name.lower()]
    if row.empty:
        return None
    row = row.iloc[0]
    return {
        f"{prefix}_HP": row["HP"],
        f"{prefix}_Attack": row["Attack"],
        f"{prefix}_Defense": row["Defense"],
        f"{prefix}_SpAtk": row["SpAtk"],
        f"{prefix}_SpDef": row["SpDef"],
        f"{prefix}_Speed": row["Speed"],
        f"{prefix}_Legendary": int(row["Legendary"]),
        f"{prefix}_Type1": row["Type1"],
        f"{prefix}_Type2": (
            row["Type2"] if pd.notna(row["Type2"]) and row["Type2"] != "" else "None"
        ),
        f"{prefix}_Generation": row["Generation"],
    }


def get_image_url(name):
    words = name.strip().split()

    if len(words) >= 2 and words[0].lower() == "mega":
        base_name = words[1].lower()

        if len(words) > 2:
            extra = "-".join(word.lower() for word in words[2:])
            formatted_name = f"{base_name}-mega-{extra}"
        else:
            formatted_name = f"{base_name}-mega"
    else:
        formatted_name = name.strip().lower().replace(" ", "-")
    print("printing: " + formatted_name)
    return f"https://img.pokemondb.net/artwork/avif/{formatted_name}.avif"
