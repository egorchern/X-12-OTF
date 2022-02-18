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

async function render_edit_blog(blog_id){
    let blog_data = await get_blog(blog_id)
    console.log(blog_data)
}

//create_blog({blog_body: {text: "Hello"} ,blog_title: "My test", category: "testing", word_count: 1})
// delete_blog(1)