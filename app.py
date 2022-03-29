import flask
import os
import json
import flask_mail
from modules.database_interface import Database
from modules.auth import Auth
from modules.api import Api
from modules.recommend import Recommend


# Get database url
database_uri = os.environ.get('DATABASE_URL')

# Heroku fix, won't work if this is not done
if database_uri.startswith("postgres://"):
    database_uri = database_uri.replace("postgres://", "postgresql://", 1)

# Get mail credentials
mailing_email = os.environ.get('MAILING_EMAIL')
mailing_password = os.environ.get('MAILING_PASSWORD')

#Hcaptcha secret key
hcaptcha_secret = os.environ.get('HCAPTCHA_SECRET')
# Initialize flask app
app = flask.Flask(__name__, static_url_path='',
                  static_folder='static', template_folder='static')
app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = mailing_email
app.config['MAIL_PASSWORD'] = mailing_password
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = flask_mail.Mail(app)


# Initialize component classes

db = Database(app)
auth = Auth(db, mail, hcaptcha_secret)
recommend = Recommend(db, auth)

api = Api(db, auth, recommend, mail, hcaptcha_secret)
auth.recommend = recommend


# This registers routes from external modules
app.register_blueprint(auth.auth_api)
app.register_blueprint(api.api)
app.register_blueprint(recommend.recommend_api)

# Index route, simply send the html doc


@app.route('/', methods=['GET'])
def index():
    # msg = flask_mail.Message("Test mail header", sender=mailing_email, recipients=['egorch.formal@gmail.com'])
    # msg.body = f"Hi, its me, this is a test email, my database uri is: ${database_uri}"
    # mail.send(msg)
    return flask.render_template('index.html')

# Routes for internal page states


@app.route('/home', methods=['GET'])
def home():
    return flask.render_template('index.html')


@app.route('/aboutus', methods=['GET'])
def aboutus():
    return flask.render_template('index.html')

# Routes for internal page states

@app.route('/legalpage', methods=['GET'])
def legalpage():
    return flask.render_template('index.html')

@app.route('/termsandcons', methods=['GET'])
def termsandcons():
    return flask.render_template('index.html')

@app.route('/contentguidelines', methods=['GET'])
def acontentguidelines():
    return flask.render_template('index.html')


@app.route('/login-register', methods=['GET'])
def login_register():
    return flask.render_template('index.html')


@app.route('/profile/<username>', methods=['GET'])
def profile_page(username):
    return flask.render_template('index.html')


@app.route('/edit_blog/<blog_id>', methods=['GET'])
def edit_blog(blog_id):
    return flask.render_template('index.html')


@app.route('/blog/<blog_id>', methods=['GET'])
def view_blog(blog_id):
    return flask.render_template('index.html')


@app.route("/recover_password/<user_id>/<recovery_token>", methods=['GET'])
def recover_password(user_id, recovery_token):
    return flask.render_template('index.html')

@app.route("/search", methods=['GET'])
def search():
    return flask.render_template('index.html')

@app.route("/admin", methods=['GET'])
def admin():
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
    app.run(debug=True, threaded=True)
