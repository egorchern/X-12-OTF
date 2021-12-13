import bcrypt
import re
from secrets import token_urlsafe
class Auth:
    def __init__(self, db):

        self.tokens_dict = {

        }
        self.db = db
        self.token_length = 60
        self.client_identifier_length = 60
        self.load_auth_tokens()
        print(self.tokens_dict)
    
    def hash(self, text) -> str:
        """Returns a hashed text"""
        password = text.encode("utf-8")
        salt = bcrypt.gensalt()
        hash = bcrypt.hashpw(password, salt)
        return hash

    def load_auth_tokens(self):
        result = self.db.get_all_auth_tokens()
        for row in result:
            self.tokens_dict[row.get("auth_token")] = row.get("user_id") 

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
        2 - invalid credentials
        3 - some other error
        """
        # Get parameters from request
        identifier = user_data.get("identifier")
        password = user_data.get("password")
        client_identifier = user_data.get("client_identifier")
        # Check that all parameters are of right format 
        if not isinstance(identifier, str) or not isinstance(password, str) or not isinstance(client_identifier, str):
            return {
                "code": 3
            }
        
        user_id, credentials_matching = self.credentials_matching(identifier, password)
        resp = {}
        if credentials_matching:
            # If credentials match, generate token and include in hashmap
            token = self.generate_token()
            self.tokens_dict[token] = user_id
            result = self.db.insert_auth_token(user_id, token, client_identifier)
            print(result)
            resp["token"] = token
            resp["code"] = 1
        else:
            resp["code"] = 2
            
        return resp
            
    def register(self, user_data: dict) -> dict:
        """Registers a new user, calls insert into database
        1 - successfull registration,
        2 - username already exists,
        3 - email already exists,
        4 - invalid input,
        5 - some other error
        """
        # Get parameters from request
        username = user_data.get("username")
        password = user_data.get("password")
        date_of_birth = user_data.get("date_of_birth")
        email = user_data.get("email")
        # Check that all parameters are strings, so not empty or other data types
        if not isinstance(username, str) or not isinstance(password, str) or not isinstance(date_of_birth, str) or not isinstance(email, str):
            return {
                "code": 4
            }
        # hash password using bcrypt
        hashed_password = self.hash(password).decode("utf-8")
        # Call insert into database
        result = self.db.insert_new_user(
            username,
            email,
            hashed_password,
            date_of_birth
        )
        resp = {}
        # if just successfully registered then retun 1
        if result is True:
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

    def get_username_and_access_level(self, auth_token: str) -> list:
        user_id = self.tokens_dict.get(auth_token)
        if user_id is not None:
            # Get username and access level
            result = self.db.get_user_auth_info(user_id)
            return result[0]
        # If user is not logged in, their access level is 1
        else:
            return {
                "username": None,
                "access_level": 1
            }