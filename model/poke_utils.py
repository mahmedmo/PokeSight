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
    words = name.lower().strip().split()

    if len(words) >= 2:
        if words[0] == "mega":
            base_name = words[1]
            if len(words) > 2:
                extra = "-".join(word.lower() for word in words[2:])
                formatted_name = f"{base_name}-mega-{extra}"
            else:
                formatted_name = f"{base_name}-mega"
        elif len(words) >= 2 and words[0] == "zygarde":
            if words[1] == "half":
                formatted_name = f"{words[0]}-50"
            elif words[1] == "complete":
                formatted_name = f"{words[0]}-100"
            else:
                formatted_name = f"{words[0]}-10"
        elif words[-1] == "forme":
            formatted_name = f"{words[0]}-{words[1]}"
        elif words[0] == "primal":
            formatted_name = f"{words[1]}-{words[0]}"
        elif words[0] == "mr.":
            formatted_name = f"{words[0].replace('.','')}-{words[1]}"
        elif words[1] == "jr.":
            formatted_name = f"{words[0]}-{words[1].replace('.','')}"
        elif words[0] == "wormadam":
            formatted_name = f"{words[0]}-{words[1]}"
        elif words[-1] == "rotom":
            formatted_name = f"{words[1]}-{words[0]}"
        elif words[-1] == "size":
            formatted_name = f"{words[0]}"
        elif words[-1] == "mode":
            formatted_name = f"{words[0]}-{words[1]}"
        elif words[-1] == "kyurem":
            formatted_name = f"{words[0]}-{words[1]}"
        else:
            formatted_name = name.lower().strip().replace(" ", "-")
        
    else:
        if ('♀' in words[0]):
            formatted_name = f"{words[0].replace('♀','-f')}"
        elif ('♂' in words[0]):
            formatted_name = f"{words[0].replace('♂','-m')}"
        elif ("'" in words[0]):
            temp = words[0].replace("'", '')
            formatted_name = f"{temp}"
        elif ('é' in words[0]):
            formatted_name = f"{words[0].replace('é','e')}"
        else:
            formatted_name = name.lower().strip().replace(" ", "-")

    return f"https://img.pokemondb.net/artwork/large/{formatted_name}.jpg"
