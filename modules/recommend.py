from flask import Blueprint, request as req, make_response
import json
import threading

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
            user_id = referer_info.get("user_id")
            result = self.db.insert_user_preferences(
                user_id,
                data
            )
            resp["code"] = 1
            x = threading.Thread(target=self.on_user_preferences_change, args=(user_id, ))
            x.start()
            self.on_user_preferences_change(user_id)
            return resp, 200

        @self.recommend_api.route("/api/recommendations/get_preferences", methods=["GET"])
        def get_preferences():
            """Gets the preferences of currently logged in user 
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

            temp = self.db.get_user_preferences(referer_info.get("user_id"))
            if len(temp) == 0:
                resp["code"] = 1
                resp["data"] = {}
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

        
    def on_user_preferences_change(self, user_id: int):
        # Delete all algo scores first
        temp = self.db.delete_all_algo_scores_user(user_id)
        # Now iterate through all blogs and recalc algo score
        temp = self.db.get_all_blog_ids()
        # Need to flatten the sql output to just list of blog ids like: [1, 2]
        blog_ids = [x["blog_id"] for x in temp]
        for blog_id in blog_ids:
            algo_score = self.calculate_algorithm_score_for_user(user_id, blog_id)
            res = self.db.insert_algorithm_score(user_id, blog_id, algo_score)

    def on_blog_change(self, blog_id: int): 
        # Delete all algo scores first
        temp = self.db.delete_all_algo_scores_blog(blog_id)
        all_user_ids = self.db.get_all_user_ids()
        #Iterate through users
        for entry in all_user_ids:
            # Calculate the score for each user, then store that
            user_id = entry.get("user_id")
            algo_score = self.calculate_algorithm_score_for_user(user_id, blog_id)
            res = self.db.insert_algorithm_score(user_id, blog_id, algo_score)

    def calculate_algorithm_score_for_user(self, user_id: int, blog_id: int) -> float:

        temp = self.db.get_user_preferences(user_id)
        VIEWS_FACTOR = 0.01
        RATING_FACTOR = 1
        blog_info = self.db.get_particular_blog_tile_data(blog_id)[0]
        # Calculate the score for the blog itself first
        blog_score = (
            blog_info.get("average_relevancy_rating") * RATING_FACTOR +
            blog_info.get("average_impression_rating") * RATING_FACTOR +
            blog_info.get("views") * VIEWS_FACTOR
        )
        # If user has no preferences set, then just return the blog score
        if len(temp) == 0:
            return blog_score

        user_preferences = temp[0]
        category_ids = []
        for entry in temp:
            # Categories are sorted by rank already, so just sequentially append them
            category_ids.append(entry.get("category_id"))
        category_index = category_ids.index(blog_info.get("category_id"))
        
        categories_count = self.db.get_categories_count()[0].get("count") + 1
        category_rank = abs(category_index - categories_count)
        # Customize the score for the particular user and their preferences
        CATEGORY_MATCH_FACTOR = 10
        WORD_COUNT_MAX_SCORE = 15
        ideal_word_count_difference = abs(blog_info.get("word_count") - user_preferences.get("ideal_word_count"))
        MAX_EFFECTIVE_DIFFERENCE = 1500
        word_count_percentage = abs(ideal_word_count_difference / MAX_EFFECTIVE_DIFFERENCE - 1)
        user_customized_rating = blog_score + (
            word_count_percentage * WORD_COUNT_MAX_SCORE + 
            category_rank * CATEGORY_MATCH_FACTOR
        )
        return user_customized_rating

    def inject_algo_info(self, user_id: int, blog_info: dict):
        temp = self.db.get_algo_info(user_id, blog_info.get("blog_id"))
        ret = blog_info
        algo_info = {}
        if len(temp) == 0:
            algo_info = {"algorithm_score": 0}
        else:
            algo_info = temp[0]
        ret["algorithm_info"] = algo_info
        return ret