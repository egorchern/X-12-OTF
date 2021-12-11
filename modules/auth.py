import bcrypt

class Auth:
    def __init__(self, db):

        self.tokens_dict = {

        }
        self.db = db

    def hash(self, text) -> str:
        """Returns a hashed text"""
        password = text.encode("utf-8")
        salt = bcrypt.gensalt()
        hash = bcrypt.hashpw(password, salt)
        return hash

    def register(self, user_data: dict):

        """Registers a new user, calls insert into database"""
        hashed_password = self.hash(user_data.get("password"))
        result = self.db.insert_new_user(
            user_data.get("username"),
            user_data.get("email"),
            hashed_password,
            user_data.get("date_of_birth")
        )
        print(result)


