from flask import Flask, request, jsonify
from deepmultilingualpunctuation import PunctuationModel

app = Flask(__name__)
model = PunctuationModel()

@app.route("/punctuate", methods=["POST"])
def punctuate():
    data = request.get_json()
    if "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400
    result = model.restore_punctuation(data["text"])
    return jsonify({"result": result})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

