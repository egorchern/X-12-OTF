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
    result = auth.register(request.json)
    return json.dumps(result)


@app.route("/auth/login", methods=['POST'])
def login():
    request = flask.request
    result = auth.login(request.json)
    resp = flask.make_response()
    # If successfully authenticated, set auth_token cookie
    if result.get("code") == 1:
        resp.set_cookie("auth_token", result.get("token"),
                        max_age=authenticated_expiry_seconds, httponly=True)

    resp.set_data(json.dumps({"code": result.get("code")}))
    return resp

@app.route("/auth/logout", methods=['POST'])
def logout():
    request = flask.request
    auth_token = request.cookies.get("auth_token")
    result = auth.logout(auth_token)
    
    resp = flask.make_response()
    if result.get("code") == 1:
        resp.set_cookie("auth_token", "", expires=0)
    resp.set_data(json.dumps(result))
    return resp

@app.route("/auth/get_user_info", methods=['POST'])
def get_user_info():
    request = flask.request
    auth_token = request.cookies.get("auth_token")
    return auth.get_username_and_access_level(auth_token)


@app.route("/auth/generate_client_identifier", methods=['POST'])
def generate_client_identifier():
    return json.dumps(
        {
            "client_identifier": auth.generate_client_identifier()
        }

    )


# Just a test route, to test whether access levels and authentication is working
@app.route("/test/get_all_users", methods=['GET', 'POST'])
def get_all_users():
    request = flask.request
    auth_token = request.cookies.get("auth_token")
    is_authenticated = auth.is_authenticated(
        auth_token, required_access_level=2)
    if is_authenticated:
        all_users = db.get_all_users()
        return json.dumps(all_users)
    else:
        return "You don't have permission to access this page"


if __name__ == '__main__':

    app.run(debug=True)
