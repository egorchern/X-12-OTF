let search_result_blog_ids;
const urlencode = (query_dict) => {
    let output = ""
    for (const [key, value] of Object.entries(query_dict)) {
        output += `${key}=${value}&`
    }
    return output
}

async function on_simple_search_click() {
    let blog_title = $("#quick-search-input").value
    let url_encoded = `/search?${urlencode({ blog_title: blog_title, body_contains_optional: blog_title })}`
    change_page_state(url_encoded)

}

async function on_advanced_search_click(){
    let query_dict = {

    }
    $("#title")
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
    categories_promise.then(async function(result){


        let category_options_dom_string = ``

        Object.keys(categories_hashmap).forEach((category_key, index) => {
            let category = categories_hashmap[category_key];
            console.log(category)
            category_options_dom_string += `
            <option value=${index}>${category}</option>
            `
        })
        category_options_dom_string += `<option selected>Any</option>`
        let advancedsearch = `
            <form class="flex-vertical align-center" id="advancedpagecontainer">
                <h3>Search Parameters</h3>
                <div id="advancedpagesection">
                    <div class="advancedsearchtitle">
                        
                        <div>
                            <label>Title</label>
                            <input type="text" id="title" class="form-control" placeholder="String" style="text-align: center">
                        </div>
                    </div>
                    <div class="advancedsearchtitle">
                        
                        <div>
                            <label>Keywords (separate with ,)</label>
                            <input type="text" id="keywords" class="form-control" placeholder="String" style="text-align: center">
                        </div>
                    </div>
                    <div class="advancedsearchtitle">
                        <div>
                        Date Created
                        </div>
                        <div class="flex-horizontal align-center">    
                            <input type="date" id="date-min" class="form-control" placeholder="Min Int" style="text-align: center">
                            
                            <input type="date" id="date-max" class="form-control" placeholder="Max Int" style="text-align: center; margin-left: 0.5rem;">
                        </div>
                    </div>
                    <div class="advancedsearchtitle">
                        <label>Category</label>
                        <select type="text" class="form-select" id="category">
                        ${category_options_dom_string}
                        </select>
                        
                        
                    </div>
                    
                    <div class="advancedsearchtitle">
                        <div >
                            Average Controversial Rating
                        </div>
                        <div class="flex-horizontal align-center"> 
                            <input type="text" class="form-control" id="controversial-min" placeholder="Min float" style="text-align: center">
                            
                            <input type="text" class="form-control" id="controversial-max" placeholder="Max float" style="text-align: center; margin-left: 0.5rem;">
                        </div>
                    </div>
                    <div class="advancedsearchtitle">
                        <div >
                            Average Relevancy Rating
                        </div>
                        <div class="flex-horizontal align-center"> 
                            <input type="text" class="form-control" id="relevancy-min" placeholder="Min float" style="text-align: center">
                            
                            <input type="text" class="form-control" id="relevancy-max"  placeholder="Max float" style="text-align: center; margin-left: 0.5rem;">
                        </div>
                        </div>
                    <div class="advancedsearchtitle">
                        <div >
                            Average Impression Rating
                        </div>
                        <div class="flex-horizontal align-center"> 
                            <input type="text" class="form-control" id="impression-min" placeholder="Min float" style="text-align: center">
                            &nbsp
                            <input type="text" class="form-control" id="impression-max" placeholder="Max float" style="text-align: center; margin-left: 0.5rem;">
                        </div>
                    </div>
                    <div class="advancedsearchtitle">
                        <div >
                            Creator's Username
                        </div>
                        <div >
                            <input type="text" class="form-control" id="username" placeholder="(String)" style="text-align: center">
                        </div>
                    </div>
                    
                </div>
                <button type="submit" class="btn btn-outline-primary flex-horizontal align-center" id="advanced-search-btn">
                    <span class="material-icons" >
                    search
                    </span>
                    <b>Search</b>
                </button>
            </form>
        `
        let serach_results = `
        <h3 style="text-align: center">Search results</h3>
        <span class="width-full flex-horizontal" style="justify-content:flex-end">Blogs shown: <strong id="blogs-shown" style="margin-left:2px">?/?</strong></span>
        <div id="authored-blogs-container" class="flex-horizontal align-center flex-wrap">
                    
        </div>`
        $("#search-page").insertAdjacentHTML("beforeend", advancedsearch)
        $("#advancedpagecontainer").onsubmit = (ev) => { ev.preventDefault(); on_advanced_search_click(); }
        $("#search-page").insertAdjacentHTML("beforeend", serach_results)
        console.log(search_query)
        // Need to reset this variable to prevent pages from affecting each other, like profile authored blogs affect this variable
        currently_showing = 0;
        currently_hidden = 0;
        let temp = await search_blogs(search_query)
        search_result_blog_ids = temp.data
        // TEMPORARY

        initialize_show_more_blogs_btn(search_result_blog_ids)
        fetch_and_render_next_blog_tiles(search_result_blog_ids)
    })
}

//search_blogs({})