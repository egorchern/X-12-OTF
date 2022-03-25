let blog_ids = []

const random = (min, max) => {
    let num = Math.random() * (max - min) + min;

    return Math.round(num);
};

async function render_random_blog_recommend(){
    let temp = $("#random-blog .blog-tile")
    if (temp != null){
        temp.remove();
    }
    let res_temp = await get_all_blog_ids()
    if (res_temp.code != 1){
        $("#home-container").insertAdjacentHTML("beforeend",`<h4>No blogs exist</h4>`)
        return null;
    }
    blog_ids = res_temp.data
    let used_blog_ids_count = 0
    let random_blog_id = blog_ids[random(0, blog_ids.length - 1)].blog_id;
    res_temp = await get_certain_blog_tiles_data([random_blog_id]);
    if (res_temp.code != 1){
        return null;
    }
    let blog_tile = res_temp.data[0];
    used_blog_ids_count++;
    console.log(blog_tile, random_blog_id)
    // Loop until the blog fits user's preference or until we exhaust the list of possible blogs
    while(!fits_preferences(blog_tile) && used_blog_ids_count < blog_ids.length){
        let random_blog_id = blog_ids[random(0, blog_ids.length - 1)].blog_id;
        res_temp = await get_certain_blog_tiles_data([random_blog_id]);
        if (res_temp.code != 1){
            return null;
        }
        blog_tile = res_temp.data[0];
        used_blog_ids_count++;
    }
    console.log(blog_tile)
    // This means that no blogs that exist fit the users preference
    if (!fits_preferences(blog_tile)){
        $("#home-container").insertAdjacentHTML("beforeend",`<h4>No blogs exist that fit your preferences</h4>`)
        return null;
    }

    insert_blog_tile(blog_tile, "#random-blog")
    $("#new-random-blog-btn").onclick = function () {render_random_blog_recommend()}
}

async function get_all_blog_ids(){
    return fetch(`/api/blog/get_all_blog_ids`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((result) => result.json())
        .then((result) => {
            return result;
        });
}

async function render_all_recommends(){ 
    render_random_blog_recommend();
}