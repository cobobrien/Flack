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

@app.route("/delete", methods=["POST"])
def delete():
    channel_name = request.form.get("channel_name")
    id = request.form.get("id")
    object_to_delete = next((x for x in channel_messages[channel_name] if x['id'] == int(id)), None)
    index_of = channel_messages[channel_name].index(object_to_delete)
    try:
        del channel_messages[channel_name][index_of]
    except:
        return jsonify({"success": False})
    return jsonify({"success": True})


@socketio.on("submit message")
def message(data):
    channel = data["channel"]
    message = data["message"]
    sender = data["sender"]
    time = data["timestamp"]
    if len(channel_messages[channel]) > 99:
        (channel_messages[channel]).pop(0)
    if len(channel_messages[channel]) > 0:
        last_object = channel_messages[channel][-1]
        id = int(last_object["id"]) + 1
    else:
        id = 0
    data["id"] = id
    channel_messages[channel].append(data)

    emit("message submitted", {"channel": channel, "message": message, "sender": sender, "time": time, "id":id}, broadcast=True)


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")