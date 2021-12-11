import flask
import os
import PIL
import bcrypt
import json
import sys
from modules.database_interface import Database
from modules.auth import Auth
# Get database url
database_uri = os.environ.get('DATABASE_URL')
if database_uri is None:
    file = open("database_url.txt", 'r')
    database_uri = file.read()
    file.close()

if database_uri.startswith("postgres://"):
    database_uri = database_uri.replace("postgres://", "postgresql://", 1)

# Initialize flask app
app = flask.Flask(__name__, static_url_path='',
                  static_folder='static', template_folder='static')
app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = Database(app)
auth = Auth(db)
# Just send the index html, will get content via fetch


@app.route('/', methods=['GET'])
def index():
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


@app.route("/testdatabase", methods=['GET', 'POST'])
def testdatabase():
    response = []
    # This is how to execute queries on a database
    result = db.select_from_test()

    for row in result:
        temp = row._asdict()
        response.append(temp)
    return json.dumps(response)


@app.route("/auth/register", methods=['POST'])
def register():
    body = flask.request.json
    result = auth.register(body)
    return ""


if __name__ == '__main__':

    app.run(debug=True)

