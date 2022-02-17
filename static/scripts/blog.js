// TODO blog stuff

async function create_blog(blog_body){
    fetch("/api/blog/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(blog_body)
    }).then((result) => result.json())
    .then((result) => {return result.code})
}

create_blog({blog_body: "Hey" ,blog_title: "My test", category: "testing", word_count: 1})