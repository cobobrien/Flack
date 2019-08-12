import os

from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
    x = 56
    y = x
    return "Project 2: TODO"

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")