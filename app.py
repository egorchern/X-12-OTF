import flask
import PIL
import bcrypt
from flask_sqlalchemy import SQLAlchemy
# Initialize flask app
app = flask.Flask(__name__)
db = SQLAlchemy(app)

# Just send the index html, will get content via fetch
@app.route('/', methods=['GET'])
def index():
  return flask.send_file("index.html")


@app.route("/hash_password", methods=['GET', 'POST'])
def hash_password():
  params = flask.request.args
  password = params.get("password")
  if password:
    password = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hash = bcrypt.hashpw(password, salt)
    return hash
  else:
    return "Invalid params"


if __name__ == '__main__':
  app.run(threaded=True)