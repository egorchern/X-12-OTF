import bcrypt
import re
from secrets import token_urlsafe
from flask import Blueprint, request as req, make_response
import json
from datetime import datetime
import flask_mail
# TODO server-side verification for registering
class Auth:
    def __init__(self, db, mail):

        self.db = db
        self.mail = mail
        self.token_length = 48
        self.client_identifier_length = 48
        # For how long the users will be authenticated for
        authenticated_expiry_days = 15
        authenticated_expiry_seconds = authenticated_expiry_days * 24 * 60 * 60
        self.MAX_LINK_LIFETIME_IN_DAYS = 1
        self.auth_api = Blueprint("auth_api", __name__)
        # Register endpoint
        @self.auth_api.route("/auth/register", methods=['POST'])
        def reg():
            request = req
            result = self.register(request.json)
            return json.dumps(result)

        # Login endpoint
        @self.auth_api.route("/auth/login", methods=['POST'])
        def log():
            request = req
            result = self.login(request.json)
            resp = make_response()
            # If successfully authenticated, set auth_token cookie
            if result.get("code") == 1:
                resp.set_cookie("auth_token", result.get("token"),
                                max_age=authenticated_expiry_seconds, httponly=True)
            
            resp.set_data(json.dumps({"code": result.get("code")}))
            return resp

        # Logout endpoint
        @self.auth_api.route("/auth/logout", methods=['POST'])
        def logo():
            request = req
            auth_token = request.cookies.get("auth_token")
            result = self.logout(auth_token)
            
            resp = make_response()
            # if logged out, expire the auth token
            if result.get("code") == 1:
                resp.set_cookie("auth_token", "", expires=0)
            resp.set_data(json.dumps(result))
            return resp

        # User info enpoint
        @self.auth_api.route("/auth/get_user_info", methods=['POST'])
        def get_user_info():
            request = req
            
            return self.get_username_and_access_level(request)

        # Gen client id endpoint
        @self.auth_api.route("/auth/generate_client_identifier", methods=['POST'])
        def generate_client_identifier():
            return json.dumps(
                {
                    "client_identifier": self.generate_client_identifier()
                }

            )

        @self.auth_api.route("/auth/initiate_password_recovery", methods=['POST'])
        def initiate_password_recovery():
            """
            Initiates password recovery given an email from request body
            Codes:
            1 - Success
            2 - No email provided
            3 - Account does not exist
            4 - something else
            """
            request = req
            resp = {}
            data = request.json
            email = data.get("email")
            # If no email in body, return code 2
            if email is None:
                resp["code"] = 2
                return resp
            # Check if account with that email exists
            result = self.db.get_user_password_hash(email)
            if len(result) == 0:
                resp["code"] = 3
                return resp
            #Generate recovery hash, using the same function we use for password hashing
            recovery_token = self.generate_token()
            recovery_hash = self.hash(recovery_token).decode("utf-8")
            # No need to check if the row with that user exists in the table, insert will replace it if it exists
            result = self.db.insert_new_recover_token(email, recovery_hash)
            if len(result) > 0:
                resp["code"] = 1
            else:
                resp["code"] = 4
            # Send email with recovery link
            # Generate recovery url, can get host url from request, so will work on localhost and hosted on internet
            recovery_link = f"{request.url_root}recover_password/{result[0].get('user_id')}/{recovery_token}"
            try:
                msg = flask_mail.Message("Password Recovery (OTF)", sender="OTF mailing bot", recipients=[email])
                msg.body = f"It appears that you have requested a password recovery for your account. \nPlease click the link below and follow the instructions to complete password recovery.\n{recovery_link}"
                
                self.mail.send(msg)
            except:
                resp["code"] = 4
                return resp
            
            return resp
        
        @self.auth_api.route("/auth/change_password", methods=['POST'])
        def change_password():
            """Changes password
            Codes: 1 - Success
            2 - Invalid inputs
            3 - Invalid recovery token
            4 - Expired link
            """
            request = req
            data = request.json
            password = data.get("password")
            recovery_token = data.get("recovery_token")
            user_id = data.get("user_id")
            return self.change_password(user_id, recovery_token, password)

        @self.auth_api.route("/auth/check_recovery_link_status/<user_id>/<recovery_token>", methods=["GET"])
        def route_check_recovery_link_status(user_id: int, recovery_token: str):
            return self.get_recovery_link_status(user_id, recovery_token)

    # Hash password
    def hash(self, text: str) -> str:
        """Returns a hashed text"""
        password = text.encode("utf-8")
        salt = bcrypt.gensalt()
        hash = bcrypt.hashpw(password, salt)
        return hash

    # Generates some client id
    def generate_client_identifier(self) -> str:
        return token_urlsafe(self.client_identifier_length)

    def credentials_matching(self, identifier: str, password: str) -> bool:
        """Returns bool indicating whether the user with identifier exists and has matching password"""
        temp = self.db.get_user_password_hash(identifier)
        if len(temp) == 0:
            return [None, False]
        temp = temp[0]
        password_hash = temp.get("password_hash").encode("utf-8")
        password = password.encode("utf-8")
        is_match = bcrypt.checkpw(password, password_hash)
        return [temp.get("user_id"), is_match]
        
    def generate_token(self) -> str:
        return token_urlsafe(self.token_length)

    def login(self, user_data: dict) -> dict:
        """Authenticates user. Sets the auth token via cookies
        1 - successfull login
        2 - no record with such identifier
        3 - missmatching passwords
        4 - some other error
        """
        # Get parameters from request
        identifier = user_data.get("identifier")
        password = user_data.get("password")
        client_identifier = user_data.get("client_identifier")
        # Check that all parameters are of right format 
        if not isinstance(identifier, str) or not isinstance(password, str) or not isinstance(client_identifier, str):
            return {
                "code": 4
            }
        
        user_id, credentials_matching = self.credentials_matching(identifier, password)
        resp = {}
        if user_id is not None:
            if credentials_matching:
                # If credentials match, generate token and include in hashmap
                token = self.generate_token()
                # Insert the newly generated token into db
                result = self.db.insert_auth_token(user_id, token, client_identifier)
                # Updates the attribute last_accessed to current date
                self.db.update_user_last_accessed(user_id)
                resp["token"] = token
                resp["code"] = 1
            else:
                resp["code"] = 3
        else:
            resp["code"] = 2
            
        return resp
    
    def logout(self, auth_token: str) -> dict:
        """Logs out the user
        """ 
        self.db.delete_auth_token(auth_token)
        return {"code": 1}

    def register(self, user_data: dict) -> dict:
        """Registers a new user, calls insert into database
        1 - successfull registration,
        2 - username already exists,
        3 - email already exists,
        4 - invalid input,
        """
        
        def validate_inputs(username, password, date_of_birth, email):
            # Validates register input, need to do this to confirm to don't trust client security.
            temp = re.match("^\w{1,30}$", username)
            if not temp:
                return False
            temp = re.match("(?=\w*\W{1,}\w*)(?=\D*\d{1,}\D*)(?=.{8,})", password)
            if not temp:
                return False
            temp = datetime.now()
            try:
                converted_date = datetime.strptime(date_of_birth, "%Y-%m-%d")
                if converted_date >= temp:
                    return False
            except:
                return False
            temp = re.match('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])', email)
            if not temp:
                return False
            else:
                return True

        # Get parameters from request
        username = user_data.get("username")
        password = user_data.get("password")
        date_of_birth = user_data.get("date_of_birth")
        email = user_data.get("email")
        resp = {}
        temp = validate_inputs(username, password, date_of_birth, email)
        if not temp:
            resp["code"] = 4
            return resp
        # hash password using bcrypt
        hashed_password = self.hash(password).decode("utf-8")
        # Call insert into database
        result = self.db.insert_new_user(
            username,
            email,
            hashed_password,
            date_of_birth
        )
        
        # if just successfully registered then retun 1
        if result is True:
            print(f"User registered: {username}, {email}")
            resp["code"] = 1
            return resp

        # If some error occured, find the error, whether email or the username already exists
        temp = re.search("\((?P<column>.+)\)=", result)
        if temp:
            temp = temp.group("column")
            if temp == "username":
                resp["code"] = 2
            elif temp == "email":
                resp["code"] = 3
        else:
            # For other errors like invalid input, like letters in date of birth
            resp["code"] = 5


        return resp
   
    def is_authenticated(self, request, required_username: str = None, required_access_level: int = 1, required_user_id: int = None) -> bool:
        """
        Returns bool indicating whether the user is authenticated to do something given the requirements:
        required_username, default is None
        required_access_level, default is 1, which is everybody
        """
        auth_info = self.get_username_and_access_level(request)
        if required_username is not None:
            if auth_info.get("username") == required_username:
                return True
            else:
                return False
        elif required_access_level is not None:
            if auth_info.get("access_level") >= required_access_level:
                return True
            else:
                return False
        elif required_user_id is not None:
            if auth_info.get("user_id") == required_user_id:
                return True
            else:
                return False
        return True

    def get_username_and_access_level(self, request) -> list:
        """
        Returns username and access level given the request
        """
        try:
            auth_token = request.cookies.get("auth_token")
            result = self.db.get_user_auth_info(auth_token)
            return result[0]
        # If user is not logged in, their access level is 1
        except:
            return {
                "username": None,
                "access_level": 1
            }

    def get_recovery_link_status(self, user_id: int, recovery_token: str):
        """
        Returns the status of the recovery link
        Codes: 1 - Success
            2 - Invalid inputs
            3 - Invalid recovery token
            4 - Expired link
        """
        resp = {}
        # Check that inputs are of valid format
        try:
            user_id = int(user_id)
        except:
            resp["code"] = 2
            return resp
        if not isinstance(user_id, int) or not isinstance(recovery_token, str):
            resp["code"] = 2
            return resp
        # Get information about recovery entry
        recovery_info = self.db.get_recovery_token(user_id)
        if len(recovery_info) == 0:
            resp["code"] = 3
            return resp
        recovery_info = recovery_info[0]
        # Check that hashes for recovery_token from client and from db match
        are_recovery_matching = bcrypt.checkpw(recovery_token.encode("utf-8"), recovery_info.get("recovery_hash").encode("utf-8"))
        if not are_recovery_matching:
            resp["code"] = 3
            return resp
        # Check that link is not expired
        now = datetime.now()
        try:
            # Calculate difference between the date when link was created and now.
            # If bigger than max allowed, return code 4
            date_recovery_created = datetime.strptime(recovery_info.get("date_created"), "%d/%m/%Y")
            days_diff = abs(now - date_recovery_created).days
            if days_diff > self.MAX_LINK_LIFETIME_IN_DAYS:
                resp["code"] = 4
                return resp
        except:
            resp["code"] = 4
            return resp

        resp["code"] = 1
        return resp
        

    def change_password(self, user_id: int, recovery_token: str, password: str) -> dict:
        """Changes password
            Codes: 1 - Success
            2 - Invalid inputs
            3 - Invalid recovery token
            4 - Expired link
         """
        resp = {}
        link_status = self.get_recovery_link_status(user_id, recovery_token)
        if link_status.get("code") != 1:
            return link_status
        # Check that new password is strong enough
        temp = re.match("(?=\w*\W{1,}\w*)(?=\D*\d{1,}\D*)(?=.{8,})", password)
        if not temp:
            resp["code"] = 2
            return resp
        
        # Now we can finally update the password_hash in users entry
        password_hash = self.hash(password).decode("utf-8")
        result = self.db.update_password_hash(user_id, password_hash)
        if result is None:
            resp["code"] = 1
            # If successfully udpated the password hash, need to delete the recovery_token entry
            result = self.db.delete_recovery_token(user_id)
        else:
            resp["code"] = 4
        return resp