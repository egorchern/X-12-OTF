from flask import Blueprint, request as req, make_response
import json
import threading
import flask_mail

class Api:
    def __init__(self, db, auth, recommend, mail):
        self.db = db
        self.api = Blueprint("api", __name__)
        self.auth = auth
        self.recommend = recommend
        self.mail = mail
        @self.api.route("/api/profile/<username>", methods=["GET"])
        def get_profile_public_info(username):
            """
            This returns the public profile information for a user with a given username.
            Codes: 1 - successful
            2 - user does not exist
            """
            request = req
            result = self.db.get_public_profile_user_info(username)
            resp = {}
            # This means that user with that username exists
            if len(result) > 0:
                resp["code"] = 1
                # Get all blogs ids that are authored by @username
                temp_authored_blogs = self.db.get_blog_ids_authored_by(result[0]["user_id"])
                authored_blog_list = []
                # Now we need to flatten the sql output, because temp will have [{blog_id:...}] but we want just [1, 2, ...]
                for row in temp_authored_blogs:
                    authored_blog_list.append(row["blog_id"])
                result[0]["authored_blogs"] = authored_blog_list
                resp["data"] = result[0] 
            else:
                resp["code"] = 2

            return resp

        @self.api.route("/api/edit/profile/<username>", methods=["PUT"])
        def edit_profile(username):
            """
            Edits the profile given information in the body of the request. Authenticated to only the owner
            Codes: 1 - successful
            2 - Not authenticated
            """
            request = req
            resp = {}
            is_authenticated = self.auth.is_authenticated(
                request, required_username=username)
            # TODO add some input validation for the edit data
            if is_authenticated:
                result = self.db.update_user_info(request.json)
                resp["code"] = 1
            else:
                resp["code"] = 2
            return resp

        @self.api.route("/api/get_all_categories", methods=["GET"])
        def get_categories():
            resp = {}
            categories = self.db.get_all_categories()
            if isinstance(categories, str):
                resp["code"] = 2
            else:
                resp["code"] = 1
                resp["data"] = categories
            return resp

        @self.api.route("/api/blog/<blog_id>", methods=["GET"])
        def get_blog(blog_id: int):
            """
            Returns a blog information given blog_id.
            Codes: 1 - successful
            2 - blog with that id does not exist
            """
            resp = {}
            result = self.db.get_particular_blog_data(blog_id)
            if len(result) == 0:
                resp["code"] = 2
            else:
                resp["code"] = 1
                resp["blog_data"] = result[0]
                # Increment blog views, since somebody requested the expanded blog
                resul1 = self.db.increment_blog_views(blog_id)

            return resp

        @self.api.route("/api/blog/create", methods=["POST"])
        def create_blog():
            """
            Creates a new blog given blog data in the body of the request
            CODES: 1 - successfully created the blog
            2 - Not logged in
            3 - invalid input
            4 - User is banned
            """
            
            request = req
            resp = {}
            blog_data = request.json
            # Need to attach currently logged in user's user id.
            temp = self.auth.get_username_and_access_level(
                request).get("user_id")
            # This happens when user is not logged in and attempts to create a blog.
            if temp is None:
                resp["code"] = 2
                return resp
            if(get_user_banned(temp).get("user_banned")):
                resp["code"] = 4
                return resp
            blog_data["author_user_id"] = temp
            # Need to JSON the blog body
            blog_data["blog_body"] = json.dumps(blog_data.get("blog_body"))
            result = self.db.insert_new_blog(blog_data)
            # This means, problems with inserting a new blog
            if isinstance(result, str):
                print(result)
                resp["code"] = 3
            else:
                blog_id = result[0]["blog_id"]
                resp["code"] = 1
                resp["blog_id"] = blog_id
                
            return resp

        @self.api.route("/api/blog/delete/<blog_id>", methods=["DELETE"])
        def delete_blog(blog_id):
            """
            Deletes a blog given blog id. authenticated to the owner only (currently)
            CODES: 1 - successfully deleted the blog
            2 - Not authenticated
            3 - invalid blog id
            """
            
            request = req
            resp = {}
            # Fetch required username from db
            tempUsername = self.db.get_blog_author_info(blog_id)
            # This means that the blog being deleted does not exist.
            if len(tempUsername) == 0:
                resp["code"] = 3
                return resp
            author_username = tempUsername[0]["username"]
            is_authenticated = self.auth.is_authenticated(
                request, required_username=author_username)
            if not is_authenticated:
                resp["code"] = 2
                return resp
            result = self.db.delete_blog(blog_id)
            if result is None:
                resp["code"] = 1
            else:
                resp['code'] = 3
            return resp

        @self.api.route("/api/blog/edit/<blog_id>", methods=["PUT"])
        def edit_blog(blog_id):
            """
            Edits the blog given blog id. authenticated to the owner only (currently)
            Codes: 1 - successfully edited the blog
            2 - not authenticated
            3 - blog with blog id does not exist
            """
            
            resp = {}
            request = req
            resp = {}
            # Fetch required username from db
            tempUsername = self.db.get_blog_author_info(blog_id)
            # This means that the blog being deleted does not exist.
            if len(tempUsername) == 0:
                resp["code"] = 3
                return resp
            author_username = tempUsername[0]["username"]
            is_authenticated = self.auth.is_authenticated(
                request, required_username=author_username)
            if not is_authenticated:
                resp["code"] = 2
                return resp
            blog_data = request.json
            # Need to serialize blog body to JSON
            blog_data["blog_body"] = json.dumps(blog_data.get("blog_body"))
            result = self.db.update_blog(blog_data)
            if result is None:
                resp["code"] = 1
                x = threading.Thread(target=self.recommend.on_blog_change, args=(blog_id, ))
                x.start()
                
            else:
                print(result)
                resp["code"] = 3

            return resp
        
        @self.api.route("/api/blog/get_blog_tiles_from_blog_ids/<blog_ids>", methods=["GET"])
        def get_blog_tiles_from_blog_ids(blog_ids):
            """
            Returns all of the existing blog tiles data in the array.
            """
            request = req
            referer_info = self.auth.get_username_and_access_level(request)
            blog_ids = json.loads(blog_ids)
            resp = {}
            result = self.db.get_all_blog_tile_data(tuple(blog_ids))
            for i in range(len(result)):
                result[i] = self.recommend.inject_algo_info(referer_info.get("user_id"), result[i])
            resp["code"] = 1
            resp["data"] = result
            return resp

        # For testing only
        @self.api.route("/api/blog/get_all_blog_tiles_data", methods=["GET"])
        def get_all_blog_tiles_data():
            """
            Returns all of the existing blog tiles data in the array.
            """
            resp = {}
            temp = self.db.get_all_blog_ids()
            if len(temp) == 0:
                resp["code"] = 2
                resp["data"] = []
                return resp
                
            # Need to flatten the sql output to just list of blog ids like: [1, 2]
            blog_ids = [x["blog_id"] for x in temp]
            
            request = req
            referer_info = self.auth.get_username_and_access_level(request)
            result = self.db.get_all_blog_tile_data(tuple(blog_ids))
            for i in range(len(result)):
                result[i] = self.recommend.inject_algo_info(referer_info.get("user_id"), result[i])
            resp["code"] = 1
            resp["data"] = result
           
            return resp

        @self.api.route("/api/profile/<username>",methods=["DELETE"])
        def delete_user(username):
            request = req
            resp = {}
            is_authenticated = self.auth.is_authenticated(
                request, required_access_level = 2)
            # TODO add some input validation for the edit data
            if is_authenticated:
                result = self.db.delete_user(username)
                if result is None:
                    resp["code"] = 1
                else:
                    resp["code"] = 3
            else:
                resp["code"] = 2
            return resp
        
        @self.api.route("/api/search_blogs", methods=["GET"])
        def search_blogs():
            request = req
            args = request.args
            resp = {}
            search_result = self.db.get_blog_ids_by_search(args)
            # Need to flatten the sql output to just list of blog ids like: [1, 2]
            blog_ids = [x["blog_id"] for x in search_result]
            resp["data"] = blog_ids
            return resp

        @self.api.route("/api/blog/submit_rating", methods=["POST"])
        def submit_rating():
            """Submit a rating for a certain blog, only registered users allowed
            CODES: 1 - success
            2 - Blog does not exist
            3 - Not logged in or author
            4 - Already rated that blog
            5 - User is banned
            """
            request = req
            resp = {}
            temp = request.json
            rating_data = temp.get("rating_data")
            # We only want logged in users to be able to submit blog rating
            auth_info = self.auth.get_username_and_access_level(request)
            author_username = self.db.get_blog_author_info(rating_data.get("blog_id"))
            if auth_info.get("username") is None or author_username == auth_info.get("username"):
                resp["code"] = 3
                return resp
            if(get_user_banned(auth_info.user_id).get("user_banned")):
                resp["code"] = 5
                return resp
            
            rating_data["user_id"] = auth_info.get("user_id")
            blog_user_rating_from_db = self.db.get_blog_user_rating(
                rating_data.get("user_id"),
                rating_data.get("blog_id")
            )
            # This means user has rated that blog already
            if len(blog_user_rating_from_db) > 0:
                resp["code"] = 4
                return resp

            result = self.db.insert_blog_user_rating(rating_data)
            if len(result) > 0:
                resp["code"] = 1
            else:
                resp["code"] = 2
            return resp
        
        @self.api.route("/api/blog/delete_rating", methods=["DELETE"])
        def delete_rating():
            """Deletes rating for a certain blog from certain user
            CODES: 1 - success
            2 - not authenticated or rating does not exist
            """
            request = req
            resp = {}
            auth_info = self.auth.get_username_and_access_level(request)
            inpt = request.json
            result = self.db.delete_blog_user_rating(auth_info.get("user_id"), inpt.get("blog_id"))
            if result is None:
                resp["code"] = 1
            else:
                resp["code"] = 2
            return resp
        
        @self.api.route("/api/blog/<blog_id>/get_posted_rating", methods=["GET"])
        def get_posted_rating(blog_id: int):
            request = req
            referrer_info = self.auth.get_username_and_access_level(request)
            resp = {}
            # If user is not logged in, then can't return their blog rating
            if referrer_info.get("user_id") is None:
                resp["code"] = 2
                return resp, 401
            user_banned = get_user_banned(referrer_info.get("user_id")).get("data")
            if(user_banned.get("user_banned")):
                resp["code"] = 4
                return resp
            rating_data = self.db.get_blog_user_rating(referrer_info.get("user_id"), blog_id)
            if len(rating_data) == 0:
                resp["code"] = 3
            else:
                resp["code"] = 1
                resp["data"] = rating_data[0]

            return resp, 200
        
        @self.api.route("/api/blog/report", methods=['POST'])
        def report_blog():
            request = req
            resp = {}
            report_data = request.json
            user_info = self.auth.get_username_and_access_level(request)
            report_data["user_id"] = user_info.get("user_id")
            if report_data["user_id"] is None:
                resp["code"] = 2
                return resp
            result = self.db.insert_blog_report(report_data)
            if result is True:
                resp["code"] = 1
            else:
                resp["code"] = 3
            return resp
        
        @self.api.route("/api/user/report", methods=['POST'])
        def report_user():
            request = req
            resp = {}
            report_data = request.json
            user_info = self.auth.get_username_and_access_level(request)
            report_data["reporter_user_id"] = user_info.get("user_id")
            if report_data["reporter_user_id"] is None:
                resp["code"] = 2
                return resp
            result = self.db.insert_user_report(report_data)
            if result is True:
                resp["code"] = 1
            else:
                resp["code"] = 3
            return resp
            
        @self.api.route("/api/user/ban",methods=['POST'])
        def ban_user():
            request = req
            resp = {}
            data = request.json
            email = self.db.get_user_email(data.get("user_id"))
            email=email[0].get("email")
            if email is None:
                resp["code"] = 2
                return resp
            result = self.db.get_user_password_hash(email)
            if result is None:
                resp["code"] = 3
                return resp
            try:
                resp["code"] = 1
                msg = flask_mail.Message("Account ban (OTF)", sender="OTF mailing bot", recipients=[email])
                msg.body = f"Our admin team have found that your actions have breached our code of misconduct. \nHere at Open Thought Floor we take misbehaviour such as this very seriously and limitations will be placed on your account meaning you will not be able to create any new blogs."
                
                self.mail.send(msg)
            except:
                resp["code"] = 4
                return resp
            self.db.ban_user(data.get("user_id"))
            return resp

        @self.api.route("/api/blog/ban", methods=['POST'])
        def ban_blog():
            request = req
            resp = {}
            data = request.json
            email = self.db.get_user_email(data.get("author_user_id"))
            email = email[0].get("email")
            if email is None:
                resp["code"] = 2
                return resp
            result = self.db.get_user_password_hash(email)
            if result is None:
                resp["code"] = 3
                return resp
            try:
                resp["code"] = 1
                msg = flask_mail.Message("Blog ban (OTF)", sender="OTF mailing bot", recipients=[email])
                msg.body = f"Our admin team have found that one of your blogs named"+data.get("blog_title")+"has breached our code of misconduct. \nHere at Open Thought Floor we take misbehaviour such as this very seriously and limitations will be placed on this blog."
                
                self.mail.send(msg)
            except:
                resp["code"] = 4
                return resp
            self.db.delete_blog(data.get("blog_id"))
            return resp


        @self.api.route("/api/user/report_get_reports",methods=['GET'])
        def get_user_reports():
            request = req
            resp = {}
            result = self.db.return_user_reports()
            if len(result) == 0:
                resp["code"] = 2
                resp["data"] = []
                return resp

            resp["code"] = 1
            resp["data"] = result
            return resp

        @self.api.route("/api/blogs/report_get_reports",methods=['GET'])
        def get_blog_reports():
            request = req
            resp = {}
            result = self.db.return_blog_reports()
            if len(result) == 0:
                resp["code"] = 2
                resp["data"] = []
                return resp

            resp["code"] = 1
            resp["data"] = result
            return resp

        @self.api.route("/api/users/get_banned/<user_id>", methods=['GET'])
        def get_user_banned(user_id):
            request = req
            resp = {}
            result = self.db.get_user_banned(user_id)
            if(len(result)>0):
                resp["code"] = 1
                resp["data"] = result[0]
                return resp
            resp["code"] = 2
            return resp



            
            



        