import flask
import os
import PIL
import bcrypt
import json
import re
from modules.database_interface import Database
from modules.auth import Auth

# Get database url
database_uri = os.environ.get('DATABASE_URL')
if database_uri is None:
    file = open("database_url.txt", 'r')
    database_uri = file.read()
    file.close()

# Heroku database fix
if database_uri.startswith("postgres://"):
    database_uri = database_uri.replace("postgres://", "postgresql://", 1)

# Initialize flask app
app = flask.Flask(__name__, static_url_path='',
                  static_folder='static', template_folder='static')
app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
# Initialize component classes
db = Database(app)
auth = Auth(db)
# For how long the users will be authenticated for
authenticated_expiry_days = 15
authenticated_expiry_seconds = authenticated_expiry_days * 24 * 60 * 60

# Index route, simply send the html doc
@app.route('/', methods=['GET'])
def index():
    request = flask.request
    print(request.cookies.get("auth_token"))
    return flask.render_template('index.html')


@app.route("/verify_password", methods=["GET", "POST"])
def verify_password():
    # This is how you verify password
    params = flask.request.args
    password = params.get("password")
    hash = params.get("hash")
    if password and hash:
        password = password.encode("utf-8")
        hash = hash.encode("utf-8")
        result = bcrypt.checkpw(password, hash)
        return str(result)
    else:
        return "Invalid params"


@app.route("/auth/register", methods=['POST'])
def register():
    request = flask.request
    print(request.cookies)
    result = auth.register(request.json)
    return json.dumps(result)


@app.route("/auth/login", methods=['POST'])
def login():
    request = flask.request
    result = auth.login(request.json)
    resp = flask.make_response()
    resp.set_data(json.dumps(result))
    if result.get("code") == 1:
        resp.set_cookie("auth_token", result.get("token"), max_age=authenticated_expiry_seconds, httponly=True)
    return resp

    
if __name__ == '__main__':

    app.run(debug=True)

