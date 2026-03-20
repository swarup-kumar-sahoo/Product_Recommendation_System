from flask import Flask, request, jsonify
from recommender import recommend_products

app = Flask(__name__)

@app.route("/")
def home():
    return "Purchase Recommendation API Running 🚀"

@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        user_data = request.get_json()

        if not user_data:
            return jsonify({"error": "Invalid JSON"}), 400

        recommendations = recommend_products(user_data)

        return jsonify({
            "user": user_data.get("name"),
            "recommendations": recommendations
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)