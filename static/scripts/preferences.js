let preferences;
async function get_preferences() {
    return fetch("/api/recommendations/get_preferences", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },

    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });
}

async function on_save_preferences() {
    // reverse look category ids
    preferences.category_ids = []
    let reversed_categories = objectFlip(categories_hashmap);
    document.querySelectorAll("#category-rankings .draggable").forEach((category, index) => {
        let category_id = reversed_categories[category.textContent]
        preferences.category_ids.push(category_id)
    })
    let temp = await edit_preferences(preferences)
    if (temp.code === 1){
        location.reload()
    }
}

async function parse_preferences() {
    let temp = await get_preferences();
    if (temp.code != 1) { return null; }
    preferences = temp.data;
    console.log(preferences);
    if (preferences.ideal_word_count === undefined) { preferences.ideal_word_count = 200 }
    if (preferences.controversial_cutoff === undefined) { preferences.controversial_cutoff = 10 }
    if (preferences.impression_cutoff === undefined) { preferences.impression_cutoff = 10 }
    if (preferences.relevancy_cutoff === undefined) { preferences.relevancy_cutoff = 10 }
    if (preferences.category_ids[0] == null) { preferences.category_ids = [] }
}

async function edit_preferences(preferences) {
    return fetch("/api/recommendations/edit_preferences", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });
}
parse_preferences();
// edit_preferences({
//     ideal_word_count: 165,
//     category_ids: [2, 3],
//     controversial_cutoff: 5,
//     relevancy_cutoff: 10,
//     impression_cutoff: 10
// })