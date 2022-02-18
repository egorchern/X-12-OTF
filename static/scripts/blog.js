// TODO blog stuff
async function delete_blog(blog_id){
    fetch(`/api/blog/delete/${blog_id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        
    }).then((result) => result.json())
    .then((result) => {
        console.log(result);
        return result.code
    })
}

async function create_blog(blog_body){
    fetch("/api/blog/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(blog_body)
    }).then((result) => result.json())
    .then((result) => {
        console.log(result);
        return result.code
    })
}

//create_blog({blog_body: {text: "Hello"} ,blog_title: "My test", category: "testing", word_count: 1})
// delete_blog(1)