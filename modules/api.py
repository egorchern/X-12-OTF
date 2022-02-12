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