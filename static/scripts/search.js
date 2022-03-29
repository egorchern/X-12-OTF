let search_result_blog_ids;
const urlencode = (query_dict) => {
    let output = ""
    for (const [key, value] of Object.entries(query_dict)) {
        output += `${key}=${value}&`
    }
    return output
}

async function on_simple_search_click(){
    let blog_title = $("#quick-search-input").value
    let url_encoded = `/search?${urlencode({blog_title: blog_title, body_contains_optional: blog_title})}`
    change_page_state(url_encoded)
    
}

async function search_blogs(search_query) {
    
    let url = `/api/search_blogs?${search_query}`
    return fetch(url, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    
        
    }).then((result) => result.json())
    .then((result) => {
        return result
    })
}

async function render_search_page(search_query) {
    console.log(search_query)
    // Need to reset this variable to prevent pages from affecting each other, like profile authored blogs affect this variable
    currently_showing = 0;
    currently_hidden = 0;
    let temp = await search_blogs(search_query)
    search_result_blog_ids = temp.data
    // TEMPORARY
    
    initialize_show_more_blogs_btn(search_result_blog_ids)
    fetch_and_render_next_blog_tiles(search_result_blog_ids)
}

//search_blogs({})