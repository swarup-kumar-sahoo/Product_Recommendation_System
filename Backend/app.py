from flask import Flask, request, jsonify
from flask.logging import create_logger
from recommender import recommend_products, get_user_insights
import logging

app = Flask(__name__)
log = create_logger(app)
logging.basicConfig(level=logging.INFO)


# ── CORS helper (no flask-cors dependency needed) ─────────────────────────
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "Purchase Recommendation API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "POST /recommend": "Get product recommendations from purchase history",
            "POST /insights": "Get behavioural insights from purchase history",
            "GET  /products": "List all available products by category",
            "GET  /health":   "Health check",
        }
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


# ── OPTIONS pre-flight (for browser CORS) ────────────────────────────────
@app.route("/recommend", methods=["OPTIONS"])
@app.route("/insights",  methods=["OPTIONS"])
def options_handler():
    return "", 204


@app.route("/recommend", methods=["POST"])
def recommend():
    """
    POST /recommend
    Body: {
        "name": "User Name",
        "purchaseHistory": [
            { "product": "Running Shoes", "category": "Sports" },
            ...
        ]
    }
    """
    user_data = request.get_json(silent=True)

    # ── Validation ────────────────────────────────────────────────────────
    if not user_data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    if "purchaseHistory" not in user_data:
        return jsonify({"error": "Missing required field: 'purchaseHistory'."}), 400

    if not isinstance(user_data["purchaseHistory"], list):
        return jsonify({"error": "'purchaseHistory' must be an array."}), 400

    if len(user_data["purchaseHistory"]) == 0:
        return jsonify({"error": "'purchaseHistory' must not be empty."}), 400

    for i, item in enumerate(user_data["purchaseHistory"]):
        if "category" not in item:
            return jsonify({
                "error": f"Item at index {i} is missing the 'category' field."
            }), 400

    # ── Core logic ────────────────────────────────────────────────────────
    try:
        recommendations = recommend_products(user_data)
        insights = get_user_insights(user_data)

        log.info("Recommendations generated for user: %s", user_data.get("name", "unknown"))

        return jsonify({
            "user": user_data.get("name", "Unknown"),
            "insights": insights,
            "recommendations": recommendations,
        }), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 422

    except Exception as e:
        log.exception("Unexpected error in /recommend")
        return jsonify({"error": "Internal server error.", "detail": str(e)}), 500


@app.route("/insights", methods=["POST"])
def insights():
    """
    POST /insights  — return only behavioural insights, no product recommendations.
    """
    user_data = request.get_json(silent=True)

    if not user_data or "purchaseHistory" not in user_data:
        return jsonify({"error": "Missing 'purchaseHistory' in request body."}), 400

    try:
        data = get_user_insights(user_data)
        return jsonify({"user": user_data.get("name"), "insights": data}), 200

    except Exception as e:
        log.exception("Unexpected error in /insights")
        return jsonify({"error": str(e)}), 500


@app.route("/products", methods=["GET"])
def list_products():
    """GET /products — return the full product catalogue."""
    import json, os
    base_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(base_dir, "products.json")) as f:
        products = json.load(f)
    return jsonify({"categories": list(products.keys()), "products": products}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)