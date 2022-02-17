from flask import Blueprint, request as req, make_response

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
            is_authenticated = self.auth.is_authenticated(request, required_username=username)
            #TODO add some input validation for the edit data
            if is_authenticated:
                result = self.db.update_user_info(request.json)
                resp["code"] = 1
            else:
                resp["code"] = 2
            return resp
        
        @self.api.route("/api/blog/create", methods=["POST"])
        def create_blog():
            request = req
            resp = {}
            blog_data = request.json
            # Need to attach currently logged in user's user id.
            blog_data["author_user_id"] = self.auth.get_username_and_access_level(request).get("user_id")
            result = self.db.insert_new_blog(blog_data)
            return resp

        @self.api.route("/api/blog/delete/<blog_id>", methods =["DELETE"])
        def delete_blog(blog_id):
            #TODO implement this, check that the user is authenticated to delete the blog (admin or the owner). and if allowed, call databse function
            pass

        @self.api.route("/api/blog/edit/<blog_id>", methods =["PUT"])
        def edit_blog(blog_id):
            #TODO implement this, check that user is authenticated to edit the blog (owner) and if allowed, call database Function
            pass