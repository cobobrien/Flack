import os

from flask import Flask,render_template, jsonify, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

from collections import defaultdict
channel_messages = defaultdict(list)

@app.route("/")
def index():
    return render_template("index.html", channel_messages=channel_messages)

@app.route("/channel", methods=["POST"])
def channel():
    channel_name = request.form.get("channel_name")
    if channel_name in channel_messages:
        return jsonify({"success": False})
    else:
        channel_messages[channel_name] = []
        return jsonify({"success": True})

@socketio.on("submit message")
def message(data):
    channel = data["channel"]
    channel_messages[channel].append(data)
    emit("message submitted", channel_messages, broadcast=True)


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")