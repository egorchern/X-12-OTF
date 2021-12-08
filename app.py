import flask
import os
import PIL
import bcrypt
from flask_sqlalchemy import SQLAlchemy
import json
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
db = SQLAlchemy(app)

# Just send the index html, will get content via fetch


@app.route('/', methods=['GET'])
def index():
    return flask.render_template('index.html')


@app.route("/hash_password", methods=['GET', 'POST'])
def hash_password():
    # This is how to hash
    params = flask.request.args
    password = params.get("password")
    if password:
        password = password.encode("utf-8")
        salt = bcrypt.gensalt()
        hash = bcrypt.hashpw(password, salt)
        return hash
    else:
        return "Invalid params"


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
    result = db.session.execute('SELECT * FROM test')
    db.session.close()
    for row in result:
        temp = row._asdict()
        response.append(temp)
    return json.dumps(response)


if __name__ == '__main__':

    app.run(threaded=True, debug=True)
