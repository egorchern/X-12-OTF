let preferences;
async function get_preferences(){
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

async function parse_preferences(){
    let temp = await get_preferences();
    if (temp.code != 1){return null;}
    preferences = temp.data;
}

async function edit_preferences(preferences){
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