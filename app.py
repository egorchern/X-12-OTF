import flask
import os
import json
from modules.database_interface import Database
from modules.auth import Auth
from modules.api import Api

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
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Initialize component classes
db = Database(app)
auth = Auth(db)
api = Api(db, auth)

# This registers routes from external modules
app.register_blueprint(auth.auth_api)
app.register_blueprint(api.api)

# Index route, simply send the html doc
@app.route('/', methods=['GET'])
def index():
    return flask.render_template('index.html')

# Routes for internal page states
@app.route('/home', methods=['GET'])
def home():
    return flask.render_template('index.html')

# Routes for internal page states
@app.route('/login-register', methods=['GET'])
def login_register():
    return flask.render_template('index.html')

@app.route('/profile/<username>', methods=['GET'])
def profile_page(username):
    return flask.render_template('index.html')

# Just a test route, to test whether access levels and authentication is working
@app.route("/test/get_all_users", methods=['GET', 'POST'])
def get_all_users():
    request = flask.request
    is_authenticated = auth.is_authenticated(
        request, required_access_level=2)
    if is_authenticated:
        all_users = db.get_all_users()
        return json.dumps(all_users, sort_keys=True, indent=4)
    else:
        return "You don't have permission to access this page"

# Run the flask server
if __name__ == '__main__':

    app.run(debug=True)
