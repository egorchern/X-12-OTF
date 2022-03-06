const urlencode = (query_dict) => {
    let output = ""
    for (const [key, value] of Object.entries(query_dict)) {
        output += `${key}=${value}&`
    }
    return output
}
async function search_blogs(search_query) {
    
    let url_query = `/api/search_blogs?${urlencode(search_query)}`
    console.log(url_query)
    return fetch(url_query, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    
        
    }).then((result) => result.json())
    .then((result) => {
        return result
    })
}

//search_blogs({blog_title: "Pancakes", category: "Cooking"})