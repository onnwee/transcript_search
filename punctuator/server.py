from flask import Flask, request, jsonify
from deepmultilingualpunctuation import PunctuationModel
from huggingface_hub import login
import os

app = Flask(__name__)
model = PunctuationModel()

login(token=os.getenv("HUGGINGFACE_HUB_TOKEN"))

@app.route("/punctuate", methods=["POST"])
def punctuate():
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' field"}), 400

        text = data["text"].strip()
        if not text:
            return jsonify({"result": ""})  # Return empty string if input is empty

        result = model.restore_punctuation(text)
        return jsonify({"result": result})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)