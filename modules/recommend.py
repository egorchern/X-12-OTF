from flask import Blueprint, request as req, make_response
import json

class Recommend:
    def __init__(self, db, auth):
        self.db = db
        self.auth = auth
        self.recommend_api = Blueprint("recommend_api", __name__)

        @self.recommend_api.route("/api/recommendations/edit_preferences", methods=["PUT"])
        def edit_preferences():
            """Edits the preferences of a user, identified by auth token cookie. 
            Codes: 1 - succes
            2 - not logged in
            """
            resp = {}
            request = req
            referer_info = self.auth.get_username_and_access_level(request)
            # This means that user is not logged in
            if referer_info.get("username") is None: 
                resp["code"] = 2
                return resp, 401

            data = request.json
            result = self.db.insert_user_preferences(
                referer_info.get("user_id"),
                data
            )
            return resp, 200

        @self.recommend_api.route("/api/recommendations/get_preferences", methods=["GET"])
        def get_preferences():
            """Gets the preferences of currently logged in user 
            Codes: 1 - succes
            2 - not logged in
            3 - no preferences set
            """
            resp = {}
            request = req
            referer_info = self.auth.get_username_and_access_level(request)
            # This means that user is not logged in
            if referer_info.get("username") is None: 
                resp["code"] = 2
                return resp, 401

            temp = self.db.get_user_preferences(referer_info.get("user_id"))
            if len(temp) == 0:
                resp["code"] = 3
                return resp, 200

            # Need to format the db response
            category_ids = []
            for entry in temp:
                # Categories are sorted by rank already, so just sequentially append them
                category_ids.append(entry.get("category_id"))

            # union two dictionaries to combine preferences with preferred categories
            outDict = {"category_ids": category_ids} | temp[0]
            resp["data"] = outDict
            resp["code"] = 1
            return resp, 200
        
    def calculate_algorithm_scores_for_user(self, user_id: int):
        pass