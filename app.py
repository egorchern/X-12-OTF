import flask
import os
import json
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


# This registers routes from external modules
app.register_blueprint(auth.auth_api)

# Index route, simply send the html doc


@app.route('/', methods=['GET'])
def index():
    return flask.render_template('index.html')

# Just a test route, to test whether access levels and authentication is working


@app.route("/test/get_all_users", methods=['GET', 'POST'])
def get_all_users():
    request = flask.request
    auth_token = request.cookies.get("auth_token")
    is_authenticated = auth.is_authenticated(
        auth_token, required_access_level=2)
    if is_authenticated:
        all_users = db.get_all_users()
        return json.dumps(all_users, sort_keys=True, indent=4)
    else:
        return "You don't have permission to access this page"


if __name__ == '__main__':

    app.run(debug=True)
