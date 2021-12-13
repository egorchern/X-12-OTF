from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
#from flask_migrate import Migrate
#result = db.session.execute('SELECT * FROM my_table WHERE my_column = :val', {'val': 5})


class Database:
    def __init__(self, app):
        self.db = SQLAlchemy(app)
        # self.migrate = Migrate(app, self.db)
        self.create_database()

        # self.db.session.execute("""
        # UPDATE test
        # SET test_text = 'This has been updated'
        # WHERE test_id = 2
        # """)
        # self.db.session.commit()
        # self.db.session.close()

    def get_user_password_hash(self, identifier: str) -> dict:
        """Fetches password hash from the users table by either username or email"""
        query = """
        SELECT user_id, password_hash
        FROM users
        WHERE email=:identifier OR username=:identifier
        LIMIT 1
        """
        try:
            result = self.db.session.execute(query, {'identifier': identifier})
            self.db.session.commit()
            self.db.session.close()
            return self.return_formatted(result)
        # For catching errors and outputting them
        except SQLAlchemyError as e:
            error = str(e.__dict__['orig'])
            return error

    def return_formatted(self, result) -> dict:
        response = []
        for row in result:
            temp = row._asdict()
            response.append(temp)
        return response

    def create_database(self):

        def create_users_table():
            self.db.session.execute("""
            CREATE TABLE IF NOT EXISTS users 
            (
                user_id serial NOT NULL,
                username character varying(40) NOT NULL,
                email character varying(254) NOT NULL,
                password_hash text NOT NULL,
                date_of_birth date NOT NULL,
                date_last_accessed date NOT NULL,
                avatar_image_id integer NOT NULL DEFAULT 1,
                access_level integer NOT NULL DEFAULT 0,
                personal_description character varying(1000),
                date_created date NOT NULL,
                preffered_word_count integer,
                controversial_limit double precision,
                PRIMARY KEY (user_id),
                UNIQUE(username),
                UNIQUE(email)
            );
            """)
            self.db.session.commit()
            self.db.session.close()

        def create_auth_tokens_table():
            query = """
            CREATE TABLE IF NOT EXISTS auth_tokens
            (
                user_id integer NOT NULL,
                client_identifier text NOT NULL,
                auth_token text NOT NULL,
                PRIMARY KEY(client_identifier)
            )
            """
            self.db.session.execute(query)
            self.db.session.commit()
            self.db.session.close()

        create_users_table()
        create_auth_tokens_table()

    def insert_dummy_data(self):
        self.db.session.execute("""
        INSERT INTO test (test_text)
        VALUES('Hello worlds')
        """)
        self.db.session.commit()
        self.db.session.close()

    def get_all_auth_tokens(self):
        query = """
        SELECT user_id, auth_token
        FROM auth_tokens
        """
        try:
            result = self.db.session.execute(query)
            self.db.session.commit()
            self.db.session.close()
            return self.return_formatted(result)

        # For catching errors and outputting them
        except SQLAlchemyError as e:
            error = str(e.__dict__['orig'])
            return error

    def insert_new_user(self, username: str, email: str, password_hash: str, date_of_birth: str):
        """Insert new user into database
        """
        default_avatar_image_id = 1
        try:
            
            self.db.session.execute(
                """
                INSERT INTO users(username, email, password_hash, date_of_birth, date_created, date_last_accessed, avatar_image_id, access_level)
                VALUES(:username, :email, :password_hash, :date_of_birth, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :avatar_image_id, :access_level)
                """,
                {
                    'username': username,
                    'email': email,
                    'password_hash': password_hash,
                    'date_of_birth': date_of_birth,
                    'avatar_image_id': default_avatar_image_id,
                    'access_level': 1
                }
            )
            self.db.session.commit()
            self.db.session.close()
            return True
        # For catching errors and outputting them
        except SQLAlchemyError as e:
            error = str(e.__dict__['orig'])
            return error
    
    def insert_auth_token(self, user_id: int, auth_token: str, client_identifier: str):
        """Deletes old auth token with same identifier and inserts new auth_token"""
        self.delete_redundant_auth_token(client_identifier)

        query = """
        INSERT INTO auth_tokens(user_id, auth_token, client_identifier)
        VALUES(:user_id, :auth_token, :client_identifier)
        """
        try:
            self.db.session.execute(query, {
                "user_id": user_id,
                "auth_token": auth_token,
                "client_identifier": client_identifier
            })
            self.db.session.commit()
            self.db.session.close()
            return True
        # For catching errors and outputting them
        except SQLAlchemyError as e:
            error = str(e.__dict__['orig'])
            return error
    
    def delete_redundant_auth_token(self, client_identifier: str):
        query = """
        DELETE FROM auth_tokens
        WHERE client_identifier = :client_identifier
        """
        self.db.session.execute(query, {"client_identifier": client_identifier})
        self.db.session.commit()
        self.db.session.close()