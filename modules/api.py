from flask import Blueprint, request as req, make_response
import json


class Api:
    def __init__(self, db, auth):
        self.db = db
        self.api = Blueprint("api", __name__)
        self.auth = auth

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
            # This means, no problems with inserting a new blog
            if len(result) == 0:
                resp["code"] = 3
            else:
                resp["code"] = 1
                resp["blog_id"] = result[0]["blog_id"]
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
            else:
                resp["code"] = 3

            return resp
        
        @self.api.route("/api/get_blog_tiles_from_blog_ids/<blog_ids>", methods=["GET"])
        def get_blog_tiles_from_blog_ids(blog_ids):
            """
            Returns all of the existing blog tiles data in the array.
            """
            blog_ids = json.loads(blog_ids)
            resp = {}
            result = self.db.get_all_blog_tile_data(tuple(blog_ids))
            resp["code"] = 1
            resp["data"] = result
            return resp

        # For testing only
        @self.api.route("/api/get_all_blog_tiles_data", methods=["GET"])
        def get_all_blog_tiles_data():
            """
            Returns all of the existing blog tiles data in the array.
            """
            
            temp = self.db.get_all_blog_ids()
            # Need to flatten the sql output to just list of blog ids like: [1, 2]
            blog_ids = [x["blog_id"] for x in temp]
            resp = {}
            if len(blog_ids) == 0:
                resp["code"] = 2
                return resp
            result = self.db.get_all_blog_tile_data(tuple(blog_ids))
            
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
            result = self.db.insert_report(report_data)
            if result is True:
                resp["code"] = 1
            else:
                resp["code"] = 3
            return resp
        