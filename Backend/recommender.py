import pandas as pd
import numpy as np
import json
import random
import os


def load_products():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(base_dir, "products.json")) as f:
        return json.load(f)


def recommend_products(user_data):
    purchase_history = user_data.get("purchaseHistory", [])

    if not purchase_history:
        return []

    # ── Build DataFrame from purchase history ──────────────────────────────
    df = pd.DataFrame(purchase_history)

    if "category" not in df.columns:
        raise ValueError("Each purchase must include a 'category' field.")

    # ── Category frequency → affinity score ────────────────────────────────
    category_counts = df["category"].value_counts()
    total = np.sum(category_counts.values)
    category_scores = (category_counts / total).round(4)

    # ── Weighted random sampling per category ──────────────────────────────
    products_db = load_products()
    already_purchased = set(df["product"].str.lower()) if "product" in df.columns else set()

    recommendations = []

    for category, score in category_scores.items():
        if category not in products_db:
            continue

        items = products_db[category]

        # Filter out already-purchased items (case-insensitive)
        unseen = [
            item for item in items
            if item["name"].lower() not in already_purchased
        ]

        if not unseen:
            unseen = items  # fall back to full list if all purchased

        # Use rating as sampling weight so higher-rated items appear more often
        ratings = np.array([item.get("rating", 3.0) for item in unseen], dtype=float)
        weights = ratings / ratings.sum()

        num_recommend = min(2, len(unseen))
        selected_indices = np.random.choice(
            len(unseen), size=num_recommend, replace=False, p=weights
        )
        selected = [unseen[i] for i in selected_indices]

        recommendations.append({
            "category": category,
            "score": float(score),
            "purchase_count": int(category_counts[category]),
            "recommended_products": selected,
        })

    # Sort by affinity score descending
    recommendations.sort(key=lambda x: x["score"], reverse=True)

    return recommendations


def get_user_insights(user_data):
    """Return summary statistics about the user's purchase behaviour."""
    purchase_history = user_data.get("purchaseHistory", [])

    if not purchase_history:
        return {}

    df = pd.DataFrame(purchase_history)

    insights = {
        "total_purchases": int(len(df)),
        "unique_categories": int(df["category"].nunique()),
        "top_category": str(df["category"].value_counts().idxmax()),
        "category_breakdown": df["category"].value_counts().to_dict(),
    }

    return insights