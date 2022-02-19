// TODO blog stuff
async function delete_blog(blog_id){
    fetch(`/api/blog/delete/${blog_id}`, {
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
        }
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
            text: $("#blog-body").value
        },
        word_count: render_word_count(),
        category: $("#blog-category").value,
        blog_id: blog_id
    }
    let result = await submit_edit_blog(blog_data)
    console.log(result)
}

function render_word_count(){
    const count_words = (text) => {
        const regexp = /\b(\w+)\b/g;
        const array = [...text.matchAll(regexp)]
        return array.length;
    }
    let blog_body = $("#blog-body");
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
    let categories = ["Programming", "Cooking", "Some other thing"]
    let category_options_dom_string = ``
    categories.forEach((category, index) => {
        category_options_dom_string += `
        <option value=${index}>${category}</option>
        `
    })
    // ${get_blog_tile(blog_data.username, blog_data.date_created, blog_data.word_count, blog_data.category, blog_data.blog_title, 5, 7.8, 4.3, "" )}
    let edit_blog_dom_string = `
    <div id="blog-buttons-container">
        
    </div>
    <div class="blog-top-info-container">
        Some info here
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
            <div class="flex-vertical align-center">
                <div class="flex-horizontal width-full align-center">
                    <h3>Blog body:</h3>
                    <h5 style="flex-grow:1; text-align:end">Word count: <strong id="word_count">${blog_data.word_count}</strong></h5>
                </div>
                
                <textarea id="blog-body" class="form-control">
                </textarea>
            </div>
            <div class="flex-horizontal align-center">
            
                <button class="flex-horizontal align-center btn btn-primary" id="save-blog-edit">
                    <span class="material-icons">
                        check_circle
                    </span>
                    Save
                </button>
            </div>
        </div>
    </div>
    `
    
    $("#edit-blog-container").insertAdjacentHTML('beforeend', edit_blog_dom_string);
    $("#blog-body").value = blog_data.blog_body.text;
    $("#blog-body").oninput = render_word_count;
    $("#save-blog-edit").onclick = () => {on_save_blog_edit_click(blog_id)};
}

//create_blog({blog_body: {text: "Hello"} ,blog_title: "My test", category: "testing", word_count: 1})
// delete_blog(1)