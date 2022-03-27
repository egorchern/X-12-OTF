let blog_ids = []
let blog_scores = []
let current_slide_index = 1;
const random = (min, max) => {
    let num = Math.random() * (max - min) + min;

    return Math.round(num);
};

async function render_random_blog_recommend(){
    let temp = $("#random-blog .blog-tile")
    if (temp != null){
        temp.remove();
    }
    let used_blog_ids_count = 0
    let random_blog_id = blog_ids[random(0, blog_ids.length - 1)];
    res_temp = await get_certain_blog_tiles_data([random_blog_id]);
    if (res_temp.code != 1){
        return null;
    }
    let blog_tile = res_temp.data[0];
    used_blog_ids_count++;
    console.log(blog_tile, random_blog_id)
    // Loop until the blog fits user's preference or until we exhaust the list of possible blogs
    while(!fits_preferences(blog_tile) && used_blog_ids_count < blog_ids.length){
        let random_blog_id = blog_ids[random(0, blog_ids.length - 1)];
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

async function parse_all_blog_ids(){
    let res_temp = await get_all_blog_ids()
    if (res_temp.code != 1){
        return null;
    }
    res_temp.data.forEach((blog_element) => {
        // Ensures that only blogs that fit preferences will be displayed
        if(fits_preferences(blog_element) && auth_info.user_id != blog_element.author_user_id){
            blog_ids.push(blog_element.blog_id)
            blog_scores.push(blog_element.score)
        }
        
    })
}

const reset_actives = () => {
    document.querySelectorAll("#recommend-carousel .carousel-item").forEach((item) => {
        item.classList.remove("active");
    })
}

async function fetch_next_carousel_item(){
    if (currently_showing >= blog_ids.length) {
        return null;
    }
    

    let temp = await get_certain_blog_tiles_data(blog_ids.slice(currently_showing, currently_showing + blogs_increment));
    reset_actives()
    let domstring = `
    <div class="carousel-item flex-horizontal align-center active" id="carousel-item-${currently_showing}">

    </div>
    `
    $("#recommend-carousel .carousel-inner").insertAdjacentHTML("beforeend", domstring)
    if (temp.code != 1){
        return null;
    }
    let blog_tiles_data = temp.data
    blog_tiles_data.forEach((blog_tile) => {
        insert_blog_tile(blog_tile, `#carousel-item-${currently_showing}`)
    })
    

    
    currently_showing = Math.min(currently_showing + blogs_increment, blog_ids.length);
}

async function render_recommend_carousel(){
    currently_showing = 0;
    current_slide_index = 1;
    // score_sorted_blog_ids = blog_ids.sort(function(a, b) {
        
    //     return b.score - a.score
    // })
    let domstring = `
    <div style="grid-column: 1 / 3">
        <h3 style="text-align: center">Recommendation queue</h3>
        <div id="recommend-carousel" class="carousel carousel-dark slide" data-bs-interval="false">
            <div class="carousel-inner">
            </div>
            <button class="carousel-control-prev" type="button"  data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button"  data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
    </div>
    
    `
    $("#home-container").insertAdjacentHTML("beforeend", domstring)
    $("#recommend-carousel .carousel-control-next").onclick = () => {
        console.log(current_slide_index)
        if(current_slide_index * blogs_increment >= blog_ids.length){
            return null
        }
        if (current_slide_index * blogs_increment === currently_showing){
            current_slide_index += 1
            fetch_next_carousel_item()
            return null
        }
        current_slide_index += 1
        reset_actives()
        $(`#carousel-item-${(current_slide_index - 1) * blogs_increment}`).classList.add("active")
        
    }
    $("#recommend-carousel .carousel-control-prev").onclick = () => {
        console.log(current_slide_index)
        if (current_slide_index === 1){
            return null;
        }
        current_slide_index -= 1;
        reset_actives()
        $(`#carousel-item-${(current_slide_index - 1) * blogs_increment}`).classList.add("active")
    }
    fetch_next_carousel_item()
}

async function render_author_stats(){
    let domstring = `
    <div class="">
    </div>
    `
    $("#home-container").insertAdjacentHTML("beforeend", domstring)
}

async function render_all_recommends(){
    if (blog_ids.length === 0){
        await parse_all_blog_ids()
    }
    
    render_random_blog_recommend();
    render_author_stats();
    render_recommend_carousel();
}