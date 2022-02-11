from flask import Blueprint, request as req, make_response

class Api:
    def __init__(self, db):
        self.db = db
        self.api = Blueprint("api", __name__)

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