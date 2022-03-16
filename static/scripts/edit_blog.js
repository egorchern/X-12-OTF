let categories_hashmap = {}
let categories = [];

async function get_all_categories(){
    return fetch(`/api/get_all_categories`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((result) => result.json())
    .then((result) => {
        return result
    })
}

async function parse_categories(){
    // Gets all categories from the server
    let temp = await get_all_categories();
    if (temp.code != 1){
        return null;
    }
    categories_object = temp.data
    // Need to flatten the categories output into simple form ["programming", "other"]
    categories_object.forEach((category_dict) => {
        categories_hashmap[category_dict.category_id] = category_dict.category_text
        categories.push(category_dict.category_text)
    })
}

parse_categories();

async function delete_blog(blog_id){
    return fetch(`/api/blog/delete/${blog_id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        
    }).then((result) => result.json())
    .then((result) => {
        return result
    })
}

async function create_blog(blog_body){
    return fetch("/api/blog/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(blog_body)
    }).then((result) => result.json())
    .then((result) => {
        return result
    })
}

async function get_blog(blog_id){
    return fetch(`/api/blog/${blog_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((result) => result.json())
    .then((result) => {
        return result
    })
}

async function submit_edit_blog(blog_data){
    return fetch(`/api/blog/edit/${blog_data.blog_id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(blog_data)
    })
    .then((result) => result.json())
    .then((result) => {
        return result
    })
}

async function on_save_blog_edit_click(blog_id){
    let blog_data = {
        blog_title: $("#blog-title").value,
        blog_body: {
            text: $("#edit-blog-body").value
        },
        word_count: render_word_count(),
        category_id: categories_object[$("#blog-category").selectedIndex].category_id,
        blog_id: blog_id
    }
    let result = await submit_edit_blog(blog_data)
    if (result.code === 1){
        location.reload();
    }
}

async function on_delete_blog_click(blog_id){
    let user_sure = window.confirm("Are you sure you want to delete this blog?")
    if (!user_sure){
        return null;
    }
    let temp = await delete_blog(blog_id)
    console.log(temp);
    if (temp.code != 1){
        return null;
    }
    change_page_state("/home");
}

function render_word_count(){
    const count_words = (text) => {
        const regexp = /\b(\w+)\b/g;
        const array = [...text.matchAll(regexp)]
        return array.length;
    }
    let blog_body = $("#edit-blog-body");
    let word_count = count_words(blog_body.value)
    $("#word_count").innerHTML = word_count;
    return word_count;

}

async function render_edit_blog(blog_id){
    let temp = await get_blog(blog_id)
    if (temp.code != 1){
        return null;
    }
    let blog_data = temp.blog_data;
    let category_options_dom_string = ``
    
    Object.keys(categories_hashmap).forEach((category_key, index) => {
        let category = categories_hashmap[category_key];
        
        category_options_dom_string += `
        <option ${blog_data.category_id == category_key ? "selected": ""} value=${index}>${category}</option>
        `
    })
    
    // ${get_blog_tile(blog_data.username, blog_data.date_created, blog_data.word_count, blog_data.category, blog_data.blog_title, 5, 7.8, 4.3, "" )}
    let edit_blog_dom_string = `
    <div id="blog-buttons-container" class="flex-horizontal align-end">
        <button class="btn btn-outline-primary profile-control-button flex-horizontal align-center" id="view-blog" type="button" tabindex="0">
            <span class="material-icons">
            preview
            </span>
            View
        </button>
        <button class="btn btn-outline-primary profile-control-button flex-horizontal align-center" id="save-blog-edit" type="button" tabindex="0">
            <span class="material-icons">
            save
            </span>
            Save
        </button>
        <button class="btn btn-outline-danger profile-control-button flex-horizontal align-center" id="delete-blog-btn" type="button" tabindex="0">
            <span class="material-icons">
            delete
            </span>
            Delete
        </button>
        
        
    </div>
    <div class="page-container flex-vertical align-center">
        <div class="blog-container width-full">
            <div class="flex-horizontal align-center">
                <h3 style="margin:0; margin-right:1rem;">Category: </h3>
                <select class="form-select" id="blog-category">
                    ${category_options_dom_string}
                </select>
            </div>
            <div class="flex-horizontal">
                <h3 style="margin:0; margin-right:1rem;">Title: </h3>
                <input type="text" id ="blog-title" class="transparent-input form-control" value="${blog_data.blog_title}">
            </div>
            <div class="flex-vertical align-center" style="flex-grow:1">
                <div class="flex-horizontal width-full align-center">
                    <h3>Blog body:</h3>
                    <h5 style="flex-grow:1; text-align:end">Word count: <strong id="word_count">${blog_data.word_count}</strong></h5>
                </div>
                
                <textarea id="edit-blog-body" class="form-control">
                </textarea>
            </div>
            
        </div>
    </div>
    `
    
    $("#edit-blog-container").insertAdjacentHTML('beforeend', edit_blog_dom_string);
    $("#edit-blog-body").value = blog_data.blog_body.text;
    $("#edit-blog-body").oninput = render_word_count;
    $("#save-blog-edit").onclick = () => {on_save_blog_edit_click(blog_id)};
    $("#view-blog").onclick = () => {change_page_state(`/blog/${blog_id}`)};
    $("#delete-blog-btn").onclick = () => {on_delete_blog_click(blog_id)};
}
