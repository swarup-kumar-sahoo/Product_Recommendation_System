import pandas as pd
import numpy as np
import json
import random

def load_products():
    with open("products.json") as f:
        return json.load(f)

def recommend_products(user_data):
    purchase_history = user_data["purchaseHistory"]

    df = pd.DataFrame(purchase_history)

    category_counts = df["category"].value_counts()

    total = np.sum(category_counts.values)
    category_scores = category_counts / total

    products_db = load_products()

    recommendations = []

    for category, score in category_scores.items():
        if category in products_db:
            items = products_db[category]
            num_recommend = min(2, len(items))

            selected = random.sample(items, num_recommend)

            recommendations.append({
                "category": category,
                "score": float(score),
                "recommended_products": selected
            })

    return recommendations