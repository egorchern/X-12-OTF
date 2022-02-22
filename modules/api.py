from flask import Blueprint, request as req, make_response
import json


class Api:
    def __init__(self, db, auth):
        self.db = db
        self.api = Blueprint("api", __name__)
        self.auth = auth

        @self.api.route("/api/profile/<username>", methods=["GET"])
        def get_profile_public_info(username):
            request = req
            result = self.db.get_public_profile_user_info(username)
            resp = {}
            if len(result) > 0:
                resp["code"] = 1
                resp["data"] = result[0]
            else:
                resp["code"] = 2

            return resp

        @self.api.route("/api/edit/profile/<username>", methods=["PUT"])
        def edit_profile(username):
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
            # Codes: 1 - successful
            # 2 - blog with this blog_id does not exist
            resp = {}
            result = self.db.get_particular_blog_data(blog_id)
            if len(result) == 0:
                resp["code"] = 2
            else:
                resp["code"] = 1
                resp["blog_data"] = result[0]
            return resp

        @self.api.route("/api/blog/create", methods=["POST"])
        def create_blog():
            # CODES: 1 - successfully created the blog
            # 2 - Not logged in
            # 3 - invalid input
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
            # CODES: 1 - successfully deleted the blog
            # 2 - Not authenticated
            # 3 - invalid blog id
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
            # Codes: 1 - successfully edited the blog
            # 2 - not authenticated
            # 3 - blog with blog id does not exist
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
        
        # For testing only
        @self.api.route("/api/get_all_blog_tiles_data", methods=["GET"])
        def get_all_blog_tiles_data():
            blog_ids = self.db.get_all_blog_ids()
            resp = {}
            out_list = []
            for value in blog_ids:
                blog_id = value["blog_id"]
                author_info = self.db.get_blog_author_info(blog_id)[0]
                tile_info = self.db.get_particular_blog_tile_data(blog_id)[0]
                # This combines blog info and author info into one dict
                tile_info = tile_info | author_info
                out_list.append(tile_info)
            resp["data"] = out_list
            resp["code"] = 1
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