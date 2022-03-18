from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
import datetime
#from flask_migrate import Migrate


class Database:
    def __init__(self, app):
        self.db = SQLAlchemy(app)
        # self.migrate = Migrate(app, self.db)
        self.create_database()
    
    def return_formatted(self, result) -> list:
        """Formats the sql output into a nice array with dictionaries"""
        # if result.rowcount == 0: return None
        response = []
        
        for row in result:
            temp = row._asdict()
            # Need to convert dates to strings to avoid json errors
            for key in temp.keys():
                value = temp[key]
                if isinstance(value, datetime.date):
                    temp[key] = value.strftime('%d/%m/%Y')
                    
            response.append(temp)
        return response

    def create_database(self):
        """Creates the database"""

        def create_users_table():
            """Creates the users table"""
            query = """
            CREATE TABLE IF NOT EXISTS users 
            (
                user_id serial NOT NULL,
                username character varying(40) NOT NULL,
                email character varying(254) NOT NULL,
                password_hash text NOT NULL,
                date_last_accessed date NOT NULL,
                avatar_image_id integer NOT NULL DEFAULT 1,
                access_level integer NOT NULL DEFAULT 0,
                personal_description VARCHAR(1000),
                date_created date NOT NULL,
                PRIMARY KEY (user_id),
                UNIQUE(username),
                UNIQUE(email)
            );
            """
            self.execute_query(query, read_result = False)

        def create_blogs_table():
            """Creates the blog table"""
            query = """
            CREATE TABLE IF NOT EXISTS blogs
            (
                blog_id serial NOT NULL,
                blog_body JSONB NOT NULL,
                blog_title VARCHAR(500) NOT NULL,
                author_user_id SERIAL NOT NULL,
                date_created DATE NOT NULL,
                date_modified DATE NOT NULL,
                category_id INTEGER NOT NULL,
                word_count integer NOT NULL,
                views integer NOT NULL DEFAULT 0,
                average_controversial_rating real NOT NULL DEFAULT 0,
                average_relevancy_rating real NOT NULL DEFAULT 0,
                average_impression_rating real NOT NULL DEFAULT 0,
                number_ratings INT NOT NULL DEFAULT 0, 
                PRIMARY KEY (blog_id),
                CONSTRAINT fk_author_user_id
                    FOREIGN KEY(author_user_id)
                    REFERENCES users(user_id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_category_id
                    FOREIGN KEY(category_id)
                    REFERENCES categories(category_id)
            );
            """
            self.execute_query(query, read_result = False)

        def create_blog_user_ratings_table():
            """Creates the user ratings table"""
            query = """
            CREATE TABLE IF NOT EXISTS blog_user_ratings
            (
                user_id integer NOT NULL,
                blog_id integer NOT NULL,
                date_created DATE NOT NULL,
                relevancy_rating INT NOT NULL,
                controversy_rating INT NOT NULL,
                impression_rating INT NOT NULL,
                PRIMARY KEY(user_id, blog_id),
                CONSTRAINT fk_user_id
                    FOREIGN KEY(user_id)
                    REFERENCES users(user_id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_blog_id
                    FOREIGN KEY(blog_id)
                    REFERENCES blogs(blog_id)
                    ON DELETE CASCADE
            );
            """
            self.execute_query(query, read_result = False)

        def create_auth_tokens_table():
            """Creates the auth tokens table"""
            query = """
            CREATE TABLE IF NOT EXISTS auth_tokens
            (
                user_id integer NOT NULL,
                client_identifier text NOT NULL,
                auth_token text NOT NULL,
                PRIMARY KEY(client_identifier),
                CONSTRAINT fk_user_id
                    FOREIGN KEY(user_id) 
                    REFERENCES users(user_id)
                    ON DELETE CASCADE
            )
            """
            self.execute_query(query, read_result = False)

        def create_recovery_tokens_table():
            query = """
            CREATE TABLE IF NOT EXISTS recovery_tokens
            (
                user_id integer NOT NULL,
                recovery_hash text NOT NULL,
                date_created DATE NOT NULL,
                PRIMARY KEY(user_id),
                CONSTRAINT fk_user_id
                    FOREIGN KEY(user_id)
                    REFERENCES users(user_id)
                    ON DELETE CASCADE
            )
            """
            self.execute_query(query, read_result = False)
        
        def create_user_preferences_table(): 
            query = """
            CREATE TABLE IF NOT EXISTS user_preferences
            (
                user_id integer NOT NULL,
                ideal_word_count integer,
                controversial_cutoff real,
                impression_cutoff real,
                relevancy_cutoff real,
                CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id),
                CONSTRAINT fk_user_id 
                    FOREIGN KEY (user_id)
                    REFERENCES users(user_id)
                    ON DELETE CASCADE
                    
            )
            """
            self.execute_query(query, read_result = False)

        def create_categories_table():
            query = """
            CREATE TABLE IF NOT EXISTS categories
            (
                category_id SERIAL NOT NULL,
                category_text VARCHAR(200) NOT NULL, 
                PRIMARY KEY(category_id),
                UNIQUE(category_text)
            );
            
            """
            self.execute_query(query, read_result = False)

        def create_user_preference_category_linker_table():
            query = """
            CREATE TABLE IF NOT EXISTS user_preference_category_linker
            (
                user_id integer NOT NULL,
                rank integer NOT NULL,
                category_id integer NOT NULL,
                CONSTRAINT user_preference_category_linker_pkey PRIMARY KEY (user_id, rank),
                CONSTRAINT fk_category_id FOREIGN KEY (category_id)
                    REFERENCES categories (category_id)
                    ON UPDATE NO ACTION
                    ON DELETE CASCADE,
                CONSTRAINT fk_user_id FOREIGN KEY (user_id)
                    REFERENCES user_preferences (user_id)
                    ON DELETE CASCADE
            );
            """
            self.execute_query(query, read_result = False)

        def create_user_blog_algorithm_score_table():
            query = """
            CREATE TABLE IF NOT EXISTS user_blog_algorithm_score
            (
                user_id integer NOT NULL,
                blog_id integer NOT NULL,
                is_read boolean NOT NULL,
                score real NOT NULL,
                CONSTRAINT user_blog_algorithm_score_pkey PRIMARY KEY (user_id, blog_id),
                CONSTRAINT fk_blog_id FOREIGN KEY (blog_id)
                    REFERENCES blogs (blog_id) MATCH SIMPLE
                    ON DELETE CASCADE,
                CONSTRAINT fk_user_id FOREIGN KEY (user_id)
                    REFERENCES users (user_id) MATCH SIMPLE
                    ON DELETE CASCADE
                    
            );
            """
            self.execute_query(query, read_result = False)

        create_users_table()
        create_categories_table()
        create_auth_tokens_table()
        create_recovery_tokens_table()
        create_user_preferences_table()
        create_blogs_table()
        create_blog_user_ratings_table()
        create_user_preference_category_linker_table()
        create_user_blog_algorithm_score_table()
        # This ensures that at least one category exists
        temp = self.get_all_categories()
        if len(temp) == 0:
            self.insert_new_category("General")
            self.insert_new_category("Programming")
            self.insert_new_category("Hardware")

    def execute_query(self, query: str, params: dict = {}, read_result: bool = True) -> list:
        """Executes query in query param using params in parms argument. if no need to read result, must specify read_result=False"""
        try:
            result = self.db.session.execute(query, params)
            self.db.session.commit()
            self.db.session.close()
            if read_result:
                return self.return_formatted(result)
            return None
        except SQLAlchemyError as e:
            error = str(e.__dict__['orig'])
            print(error)
            return error

    #Blog functions 
    

    def increment_blog_views(self, blog_id: int):
        """Increments the blog views counter for a particular blog."""
        query = """
        UPDATE blogs
        SET views = views + 1
        WHERE blog_id = :blog_id
        """
        params = {"blog_id": blog_id}
        return self.execute_query(query, params, False)

    def get_blog_ids_authored_by(self, author_user_id: int):
        """Fetches all blog ids that are written by given author_user_id."""
        query = """
        SELECT blog_id
        FROM blogs
        WHERE author_user_id = :author_user_id
        """
        params = {"author_user_id": author_user_id}
        return self.execute_query(query, params)

    def get_all_blog_ids(self):
        """Fetches all existing blog ids"""
        query = """
        SELECT blog_id
        FROM blogs
        """
        return self.execute_query(query)
    
    def get_all_blog_tile_data(self, blog_ids: tuple):
        """Returns information required for the blog tile for particular blog"""
        query = """
        SELECT blog_id, blog_title, blogs.date_created, author_user_id, category_id, word_count, blogs.date_modified, username, avatar_image_id, views,
        average_controversial_rating, average_relevancy_rating, average_impression_rating, number_ratings
        FROM blogs
        INNER JOIN users on users.user_id = blogs.author_user_id
        WHERE blog_id IN :blog_ids
        """
        params = {'blog_ids': blog_ids}
        return self.execute_query(query, params)

    def get_particular_blog_tile_data(self, blog_id:int):
        """Returns information required for the blog tile for particular blog"""
        query = """
        SELECT blog_id, blog_title, blogs.date_created, author_user_id, category_id, word_count, blogs.date_modified, username, avatar_image_id, views,
        average_controversial_rating, average_relevancy_rating, average_impression_rating, number_ratings
        FROM blogs
        INNER JOIN users on users.user_id = blogs.author_user_id
        WHERE blog_id = :blog_id
        LIMIT 1
        """
        params = {'blog_id': blog_id}
        return self.execute_query(query, params)
    
    def get_blog_user_rating(self, user_id: int, blog_id: int):
        """Returns the information about a blog rating for a particular blog and user"""
        query = """
        SELECT *
        FROM blog_user_ratings
        WHERE blog_id = :blog_id AND user_id = :user_id
        LIMIT 1
        """
        params = {'blog_id': blog_id, "user_id": user_id}
        return self.execute_query(query, params)

    def insert_blog_user_rating(self,rating_data: dict):
        """Updates the blog user ratings data, first insert data into blog user taings, and then updating average in blog table"""
        
        query = """
        INSERT INTO blog_user_ratings (user_id, blog_id, date_created, relevancy_rating, controversy_rating, impression_rating)
        VALUES (:user_id, :blog_id, CURRENT_TIMESTAMP, :relevancy_rating, :controversy_rating, :impression_rating)
            RETURNING blog_id 
        """
        try: 
            result = self.db.session.execute(query, rating_data)
            self.db.session.commit()
            self.db.session.close()
            self.update_blog_user_ratings_count(rating_data.get("blog_id"))
            blog_data = self.get_particular_blog_data(rating_data.get("blog_id"))[0]
            temp = self.update_blog_user_ratings(rating_data,blog_data)
            return self.return_formatted(result)
            
        except SQLAlchemyError as e:
            error = str(e.__dict__['orig'])
            return error

    def update_blog_user_ratings_count(self, blog_id: int):
        """Increments the number of user ratings for a particular blog"""
        query = """
        UPDATE blogs
        SET number_ratings = number_ratings + 1
        WHERE blog_id = :blog_id      
        
        """
        params = {"blog_id": blog_id}
        return self.execute_query(query, params, False)

    def update_blog_user_ratings(self, rating_data:dict, blog_data: dict):
        """Updates the average user ratings for a blog"""
        number_of_blog_ratings = blog_data.get("number_ratings")
        old_average_controversial_rating = blog_data.get("average_controversial_rating")
        old_average_relevancy_rating = blog_data.get("average_relevancy_rating")
        old_average_impression_rating = blog_data.get("average_impression_rating")
        new_controversy_value = rating_data.get("controversy_rating")
        new_relevancy_value = rating_data.get("relevancy_rating")
        new_impression_value = rating_data.get("impression_rating")
        new_average_controversial_rating = round(old_average_controversial_rating + ((new_controversy_value - old_average_controversial_rating) / number_of_blog_ratings), 2)
        new_average_relevancy_rating = round(old_average_relevancy_rating + ((new_relevancy_value - old_average_relevancy_rating) / number_of_blog_ratings), 2)
        new_average_impression_rating = round(old_average_impression_rating + ((new_impression_value - old_average_impression_rating) / number_of_blog_ratings), 2)

        blog_id = blog_data.get("blog_id")        
        query = """
        UPDATE blogs
        SET average_controversial_rating = :average_controversial_rating, average_relevancy_rating = :average_relevancy_rating, average_impression_rating = :average_impression_rating 
        WHERE blog_id = :blog_id
        """
        params = {'average_controversial_rating': new_average_controversial_rating, 'average_relevancy_rating': new_average_relevancy_rating, 'average_impression_rating': new_average_impression_rating, 'blog_id' : blog_id}
        return self.execute_query(query, params, False)     

    def get_num_blog_user_ratings(self, rating_data: dict):
        """Gets the number of user ratings for a blog"""
        query = """
        SELECT COUNT(*)
        FROM blogs_user_ratings
        WHERE blogid = :blog_id
        """
        return self.execute_query(query, rating_data)

    def get_particular_blog_data(self, blog_id: int):
        """Returns full information for particular blog"""
        query = """
        SELECT username, avatar_image_id, 
        blog_id, blog_title, 
        blog_body, blogs.date_created, 
        author_user_id, category_id, word_count, 
        blogs.date_modified, blogs.views,
        average_controversial_rating, average_relevancy_rating, average_impression_rating, number_ratings
        number_ratings
        FROM blogs
        INNER JOIN users on users.user_id = blogs.author_user_id
        WHERE blog_id = :blog_id
        """
        params = {'blog_id': blog_id}
        return self.execute_query(query, params)

    def get_blog_author_info(self, blog_id: int):
        """Returns the information about the author of the blog"""
        query = """
        SELECT users.username, users.avatar_image_id
        FROM users
        WHERE user_id = (
            SELECT author_user_id
            FROM blogs
            WHERE blog_id = :blog_id
            LIMIT 1
        )
        LIMIT 1
        """
        params = {'blog_id': blog_id}
        return self.execute_query(query, params)

    def update_blog(self, blog_data: dict):
        """Updates the blog with given data"""
        query = """
        UPDATE blogs
        SET blog_body = :blog_body, blog_title = :blog_title, date_modified = CURRENT_TIMESTAMP, category_id = :category_id, word_count = :word_count
        WHERE blog_id = :blog_id
        """
        return self.execute_query(query, blog_data, False)

    def insert_new_blog(self, blog_data: dict):
        """Inserts a new blog into the database"""
        query = """
        INSERT INTO blogs (blog_body,blog_title,author_user_id, date_created,date_modified,category_id,word_count)
        VALUES(:blog_body, :blog_title , :author_user_id , CURRENT_TIMESTAMP, CURRENT_TIMESTAMP , :category_id, :word_count)
            RETURNING blog_id
        """
        return self.execute_query(query, blog_data)

    def delete_blog(self, blog_id: int):
        """Deletes the blog given a blog id"""
        query = """
        DELETE FROM blogs
        WHERE blog_id = :blog_id
        """
        params = {'blog_id': blog_id}
        return self.execute_query(query, params, False)

    def recalculate_new_blog_averages(self, user_id: int, blog_id: int):
        # First need to recalc blog rating averages
        user_rating = self.get_blog_user_rating(user_id, blog_id)
        if len(user_rating) == 0:
            return "error"
        user_rating = user_rating[0]
        blog_info = self.get_particular_blog_tile_data(blog_id)[0]
        number_ratings = blog_info.get('number_ratings')
        new_average_relevancy_rating = 0
        new_average_controversial_rating = 0
        new_average_impression_rating = 0
        if number_ratings > 1:
            new_average_relevancy_rating = round(
                ((number_ratings * blog_info.get('average_relevancy_rating') - user_rating.get("relevancy_rating"))
                / (number_ratings - 1)), 2
            )
            new_average_controversial_rating = round(
                ((number_ratings * blog_info.get('average_controversial_rating') - user_rating.get("controversy_rating"))
                / (number_ratings - 1)), 2
            )
            new_average_impression_rating = round(
                ((number_ratings * blog_info.get('average_impression_rating') - user_rating.get("impression_rating"))
                / (number_ratings - 1)), 2
            )
        query = """
        UPDATE blogs
        SET average_controversial_rating = :average_controversial_rating,
        average_relevancy_rating = :average_relevancy_rating,
        average_impression_rating = :average_impression_rating,
        number_ratings = number_ratings - 1;
        """
        params = {
            "average_relevancy_rating": new_average_relevancy_rating,
            "average_impression_rating": new_average_impression_rating,
            "average_controversial_rating": new_average_controversial_rating
        }
        return self.execute_query(query, params, False)

    def delete_blog_user_rating(self, user_id: int, blog_id: int):

        result = self.recalculate_new_blog_averages(user_id, blog_id)
        if result == "error":
            return "error"

        query = """
        DELETE FROM blog_user_ratings
        WHERE user_id = :user_id AND blog_id = :blog_id
        """
        params = {"blog_id": blog_id, "user_id": user_id}
        return self.execute_query(query, params, False)

    
    # Blog functions

    # User functions

    def delete_user(self, username: str):
        query = """
        DELETE FROM users
        WHERE username = :username
        """
        params = {'username': username}
        return self.execute_query(query, params, False)
        
    def get_user_password_hash(self, identifier: str) -> dict:
        """Fetches password hash from the users table by either username or email"""
        query = """
        SELECT user_id, password_hash
        FROM users
        WHERE email=:identifier OR username=:identifier
        LIMIT 1
        """
        params = {'identifier': identifier}
        return self.execute_query(query, params)

    def get_public_profile_user_info(self, username: str):
        """Returns public profile information of the user"""
        query = """
        SELECT user_id, avatar_image_id, date_created, date_last_accessed, personal_description
        FROM users
        WHERE username=:username
        LIMIT 1
        """
        params = {'username': username}
        return self.execute_query(query, params)
    
    def get_user_auth_info(self, auth_token: str) -> dict:
        """Returns user auth information given a token"""
        query = """
        SELECT username, access_level, users.user_id
        FROM users
        INNER JOIN auth_tokens on users.user_id = auth_tokens.user_id
        WHERE auth_token=:auth_token
        LIMIT 1
        """
        params = {"auth_token": auth_token}
        return self.execute_query(query, params)
    
    def update_user_info(self, user_info: dict):
        """Updates the users information with parameters. Only personal descr for now"""
        query = """
        UPDATE users
        SET personal_description = :personal_description, avatar_image_id = :avatar_image_id
        WHERE user_id = :user_id
        """
        params = user_info
        return self.execute_query(query, params, False)

    def get_all_user_ids(self):
        """Returns information about all users. Delete after testing"""
        query = """
        SELECT user_id
        FROM users
        """
        return self.execute_query(query)
    
    def insert_new_user(self, username: str, email: str, password_hash: str, date_of_birth: str):
        """Insert new user into database
        """
        query = """
        INSERT INTO users(username, email, password_hash, date_created, date_last_accessed, avatar_image_id, access_level)
                VALUES(:username, :email, :password_hash, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :avatar_image_id, :access_level)
        """
        default_avatar_image_id = 1
        params = {
            'username': username,
            'email': email,
            'password_hash': password_hash,
            'date_of_birth': date_of_birth,
            'avatar_image_id': default_avatar_image_id,
            'access_level': 1
        }
        return self.execute_query(query, params, False)    
        
    
    def insert_auth_token(self, user_id: int, auth_token: str, client_identifier: str):
        """Deletes old auth token with same identifier and inserts new auth_token"""
        self.delete_redundant_auth_token(client_identifier)

        query = """
        INSERT INTO auth_tokens(user_id, auth_token, client_identifier)
        VALUES(:user_id, :auth_token, :client_identifier)
        """
        params = {
            "user_id": user_id,
            "auth_token": auth_token,
            "client_identifier": client_identifier
        }
        
        return self.execute_query(query, params, False)    
    
    def delete_auth_token(self, auth_token: str):
        """Deletes auth token """
        query = """
        DELETE FROM auth_tokens
        WHERE auth_token = :auth_token
        """
        params = {'auth_token': auth_token}
        return self.execute_query(query, params, False)   
        
    def delete_redundant_auth_token(self, client_identifier: str):
        query = """
        DELETE FROM auth_tokens
        WHERE client_identifier = :client_identifier
        """
        params = {"client_identifier": client_identifier}
        
        return self.execute_query(query, params, False)   

    def update_user_last_accessed(self, user_id: int):

        query = """
        UPDATE users
        SET date_last_accessed = CURRENT_TIMESTAMP
        WHERE user_id = :user_id
        """
        params = {"user_id": user_id}
        return self.execute_query(query, params, False)

    # User functions

    # Recovery functions 

    def insert_new_recover_token(self, email: str, recovery_hash: str):
        query = """
        DELETE FROM recovery_tokens
        WHERE 
            EXISTS(SELECT user_id FROM users WHERE email = :email) AND
            user_id = (SELECT user_id FROM users WHERE email = :email);
        INSERT INTO recovery_tokens
        VALUES(
            (SELECT user_id FROM users WHERE email = :email),
            :recovery_hash,
            CURRENT_TIMESTAMP
        )
        RETURNING user_id;
        """
        params = {"email": email, "recovery_hash": recovery_hash}
        return self.execute_query(query, params)

    def get_recovery_token(self, user_id: int):
        query = """
        SELECT *
        FROM recovery_tokens
        WHERE user_id = :user_id
        LIMIT 1
        """
        params = {"user_id" : user_id}
        return self.execute_query(query, params)

    def update_password_hash(self, user_id: int, password_hash: str):
        query = """
        UPDATE users
        SET password_hash = :password_hash
        WHERE user_id = :user_id
        """
        params = {"password_hash": password_hash, "user_id": user_id}
        return self.execute_query(query, params, False)
    
    def delete_recovery_token(self, user_id: int):
        query = """
        DELETE FROM recovery_tokens
        WHERE user_id = :user_id
        """
        params = {"user_id": user_id}
        return self.execute_query(query, params, False)
    
    # Recovery function
    
    def get_blog_ids_by_search(self, search_query: dict):
        """Returns blog ids of blogs searched by search query dictionary, supports arbitrary length"""
        query = "SELECT blog_id FROM blogs"
        # Basically list all posible search query parameters, if they are set
        # Then need to include them in WHERE
        params = {}
        param_found = False
        if "blog_title" in search_query:
            # Need to add percents around query and parameterize to avoid sql inject
            temp = f"%{search_query['blog_title']}%"
            params["blog_title"] = temp
            # Use lower to not care about letter case
            if param_found:
                query += " AND "
            else:
                query += "  WHERE "
            param_found = True
            query += " LOWER(blog_title) LIKE LOWER(:blog_title)"
        if "body_contains_optional" in search_query:
            # TODO change to iterate through key words
            if param_found:
                query += " OR "
            else:
                query += "  WHERE "
            param_found = True
            temp = f"%{search_query['body_contains_optional']}%"
            params["body_contains_optional"] = temp
            query += " LOWER(blog_body ->> 'text') LIKE LOWER(:body_contains_optional)"
        # TODO change this to work with category_id
        if "category" in search_query:
            params["category"] = search_query["category"]
            # If we added someting into WHERE, we need to add AND between params
            if param_found:
                query += " AND "
            else:
                query += "  WHERE "
            param_found = True
            query += " category = :category"
        return self.execute_query(query, params)
    
    # Category functions

    def get_all_categories(self):
        query = """
        SELECT *
        FROM categories
        """
        return self.execute_query(query)

    def insert_new_category(self, category_text: str):
        query = """
        INSERT INTO categories(category_text)
        VALUES(:category_text)
        """
        params = {'category_text': category_text}
        return self.execute_query(query, params, False)

    def get_categories_count(self):
        query = """
        SELECT COUNT(*) 
        FROM categories
        """
        return self.execute_query(query)

    # Category functions


    # Discover/recommend functions

    def get_user_preferences(self, user_id: int):
        query = """
        SELECT *
        FROM user_preferences
        FULL JOIN user_preference_category_linker on user_preferences.user_id = user_preference_category_linker.user_id
        WHERE user_preferences.user_id = :user_id
        ORDER BY rank
        """
        params = {'user_id': user_id}
        return self.execute_query(query, params)

    def delete_user_preferences(self, user_id: int): 
        query = """
        DELETE FROM user_preferences
        WHERE user_id = :user_id
        """
        params = {'user_id': user_id}
        return self.execute_query(query, params, False)

    def insert_user_preferences(self, user_id: int, preferences: dict):
        self.delete_user_preferences(user_id)
        
        query = """
        INSERT INTO user_preferences(user_id, ideal_word_count, controversial_cutoff, impression_cutoff, relevancy_cutoff)
        VALUES(:user_id, :ideal_word_count, :controversial_cutoff, :impression_cutoff, :relevancy_cutoff)
        """
        params = preferences
        params['user_id'] = user_id
        result = self.execute_query(query, params, False)
        # if result is None:
        return self.insert_category_rankings(user_id, preferences.get("category_ids"))

    def delete_user_category_rankings(self, user_id: int):
        query = """
        DELETE FROM user_preference_category_linker
        WHERE user_id = :user_id
        """
        params = {'user_id': user_id}
        return self.execute_query(query, params, False)
        
    def insert_category_rankings(self, user_id: int, category_ids: list):
        if category_ids is None:
            return None
        # First need to delete old category rankings, since don't know how user modified them
        tmp = self.delete_user_category_rankings(user_id)
        query = """
        INSERT INTO user_preference_category_linker(user_id, rank, category_id)
        VALUES (:user_id, :rank, :category_id)
        """
        # Need to iterate through categories, 0 index - highest rank
        for i in range(len(category_ids)):
            # Need to + 1 because want to have human ranking, like starting from 1
            params = {
                'user_id': user_id,
                'category_id': category_ids[i],
                'rank': i + 1
            }
            tmp = self.execute_query(query, params, False)

        return None
    
    def insert_algorithm_score(self, user_id: int, blog_id: int, score: float):
        query = """
        INSERT INTO user_blog_algorithm_score (user_id, blog_id, is_read, score)
        VALUES(:user_id, :blog_id, False, :score)
        """
        params = {"user_id" : user_id, "blog_id": blog_id, "score": score}
        return self.execute_query(query, params, False)
    
    def delete_algorithm_scores_user(self, user_id):
        query = """
        DELETE FROM user_blog_algorithm_score
        WHERE user_id = :user_id
        """
        params = {"user_id": user_id}
        return self.execute_query(query, params, False)

    def delete_all_algo_scores_blog(self, blog_id: int):
        query = """
        DELETE FROM user_blog_algorithm_score
        WHERE blog_id = :blog_id
        """
        params = {"blog_id": blog_id}
        self.execute_query(query, params, False)
    
    def delete_all_algo_scores_user(self, user_id: int):
        query = """
        DELETE FROM user_blog_algorithm_score
        WHERE user_id = :user_id
        """
        params = {"user_id": user_id}
        self.execute_query(query, params, False)
    
    def get_algo_info(self, user_id: int, blog_id: int):
        query = """
        SELECT score, is_read
        FROM user_blog_algorithm_score
        WHERE user_id = :user_id AND blog_id = :blog_id
        LIMIT 1;
        """
        params = {"user_id": user_id, "blog_id": blog_id}
        return self.execute_query(query, params)

    # Discover/recommend functions
    