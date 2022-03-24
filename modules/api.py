from flask import Blueprint, request as req, make_response
import json
import threading
import requests

class Api:
    def __init__(self, db, auth, recommend, hcaptcha_secret):
        self.db = db
        self.api = Blueprint("api", __name__)
        self.auth = auth
        self.recommend = recommend
        self.hcaptcha_secret = hcaptcha_secret
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
            # hcaptcha_response = temp.get("hcaptcha_response")
            # # Hcaptcha verify component
            # hcaptcha_verify_url = "https://hcaptcha.com/siteverify"
            # res = requests.post(
            #     hcaptcha_verify_url,
            #     data = {
            #         "secret": self.hcaptcha_secret,
            #         "response": hcaptcha_response
            #     },
            #     timeout = 5
                    
            # )
            # res_json = res.json()
            # if not res_json["success"]:
            #     resp["code"] = 5
            #     return resp, 400
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
            if not isinstance(result, str):
                resp["code"] = 1
                x = threading.Thread(target=self.recommend.on_blog_change, args=(rating_data.get("blog_id"), ))
                x.start()
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
                x = threading.Thread(target=self.recommend.on_blog_change, args=(inpt.get("blog_id"), ))
                x.start()
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
            # hcaptcha_response = report_data.get("hcaptcha_response")
            # # Hcaptcha verify component
            # hcaptcha_verify_url = "https://hcaptcha.com/siteverify"
            # res = requests.post(
            #     hcaptcha_verify_url,
            #     data = {
            #         "secret": self.hcaptcha_secret,
            #         "response": hcaptcha_response
            #     },
            #     timeout = 5
                    
            # )
            # res_json = res.json()
            # if not res_json["success"]:
            #     resp["code"] = 5
            #     return resp, 400
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
            # hcaptcha_response = report_data.get("hcaptcha_response")
            # # Hcaptcha verify component
            # hcaptcha_verify_url = "https://hcaptcha.com/siteverify"
            # res = requests.post(
            #     hcaptcha_verify_url,
            #     data = {
            #         "secret": self.hcaptcha_secret,
            #         "response": hcaptcha_response
            #     },
            #     timeout = 5
                    
            # )
            # res_json = res.json()
            # if not res_json["success"]:
            #     resp["code"] = 5
            #     return resp, 400
            result = self.db.insert_user_report(report_data)
            if result is True:
                resp["code"] = 1
            else:
                resp["code"] = 3
            return resp
            
        @self.api.route("/api/blog/post_comment", methods=['POST'])
        def post_comment():
            request = req
            resp = {}
            referer_info = self.auth.get_username_and_access_level(request)
            if referer_info.get("username") is None:
                resp["code"] = 2
                return resp, 401
            
            data = request.json
            # hcaptcha_response = data.get("hcaptcha_response")
            # # Hcaptcha verify component
            # hcaptcha_verify_url = "https://hcaptcha.com/siteverify"
            # res = requests.post(
            #     hcaptcha_verify_url,
            #     data = {
            #         "secret": self.hcaptcha_secret,
            #         "response": hcaptcha_response
            #     },
            #     timeout = 5
                    
            # )
            # res_json = res.json()
            # if not res_json["success"]:
            #     resp["code"] = 5
            #     return resp, 400
            result = self.db.insert_new_comment(
                referer_info.get("user_id"),
                data.get("blog_id"),
                data.get("comment_text")
            )
            if result is None:
                resp["code"] = 1
                return resp
            else:
                resp["code"] = 3
                return resp, 400

        @self.api.route("/api/blog/<blog_id>/get_comment_ids", methods=["GET"])
        def get_comment_ids(blog_id: int):
            resp = {}
            data = self.db.get_all_comment_ids_for_blog(blog_id)
            # This means no error occured
            if not isinstance(data, str):
                resp["code"] = 1
                comment_ids = []
                for entry in data:
                    comment_ids.append(entry.get("comment_id"))
                resp["data"] = comment_ids
            else:
                resp["code"] = 2
            
            return resp
        
        @self.api.route("/api/blog/edit_comment", methods=["PUT"])
        def edit_comment():
            """Edits the comment, comment_id needs to be in body
            CODES: 1 - success
            2 - bad blog_id
            """
            resp = {}
            request = req
            data = request.json
            comment_data = self.db.get_comment(data.get("comment_id"))
            if isinstance(comment_data, str) or len(comment_data) == 0:
                resp["code"] = 2
                return resp, 400
            comment_data = comment_data[0]
            is_authenticated = self.auth.is_authenticated(request, required_user_id = comment_data.get("user_id"))
            if not is_authenticated:
                resp["code"] = 3
                return resp, 401

            edit_result = self.db.edit_comment_text(data.get("comment_id"), data.get("comment_text"))
            if isinstance(edit_result, str):
                resp["code"] = 2
                return resp, 400
                
            resp["code"] = 1
            return resp
        
        @self.api.route("/api/blog/delete_comment", methods=["DELETE"])
        def delete_comment():
            resp = {}
            request = req
            data = request.json
            comment_data = self.db.get_comment(data.get("comment_id"))
            if isinstance(comment_data, str) or len(comment_data) == 0:
                resp["code"] = 2
                return resp, 400
            comment_data = comment_data[0]
            is_authenticated = self.auth.is_authenticated(request, required_user_id = comment_data.get("user_id"))
            if not is_authenticated:
                resp["code"] = 3
                return resp, 401
            delete_result = self.db.delete_comment(data.get("comment_id"))
            if isinstance(delete_result, str):
                resp["code"] = 2
                return resp, 400
                
            resp["code"] = 1
            return resp
        
        @self.api.route("/api/blog/get_comments/<comment_ids>", methods=["GET"])
        def get_comments(comment_ids):
            request = req
            resp = {}
            comment_ids = json.loads(comment_ids)
            comments_data = self.db.get_comments_from_ids(tuple(comment_ids))
            if isinstance(comments_data, str):
                resp["code"] = 2
                return resp, 400
            else:
                resp["code"] = 1
                resp["data"] = comments_data
                
            return resp