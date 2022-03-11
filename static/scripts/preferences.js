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