function insert_top_blog_info(blog_data) {
    blog_data.average_controversial_rating = Number(blog_data.average_controversial_rating.toFixed(1))
    blog_data.average_relevancy_rating = Number(blog_data.average_relevancy_rating.toFixed(1))
    blog_data.average_impression_rating = Number(blog_data.average_impression_rating.toFixed(1))
    let controversial_percentage = `${(blog_data.average_controversial_rating / rating_limit * 100).toFixed(2)}%`;
    let relevancy_percentage = `${(blog_data.average_relevancy_rating / rating_limit * 100).toFixed(2)}%`;
    let impression_percentage = `${(blog_data.average_impression_rating / rating_limit * 100).toFixed(2)}%`;
    console.log(blog_data)
    let top_blog_info_dom_string = `
    <div class="flex-vertical align-center blog-tile-left">
        <img class="author-avatar" src="/images/avatar_${blog_data.avatar_image_id}.webp">
        <div class="flex-vertical align-center">
            <span>Created by:</span>
            <button style="font-weight: bolder" class="hoverable-text" id="author_hyperlink" role="navigation" tabindex="0">${blog_data.username}</button>
        </div>
        <div class="flex-vertical align-center">
            <span>Word count:</span>
            <strong>${blog_data.word_count}</strong>
        </div>
    </div>
    <div class="flex-vertical align-center">
        <div class="width-full flex-horizontal align-center blog-bar-container" style="flex-grow:1">
            <div class="flex-vertical">
                <span>Controversial: </span>
            </div>
            
            <div class="bar-container">
                <div class="bar-fill" style="width: ${controversial_percentage};background-color:red">
                </div>
            </div>
            <div class="flex-vertical align-center">
                <strong>${blog_data.average_controversial_rating}/${rating_limit}</strong>
            </div>
        </div>
        <div class="flex-horizontal align-center" style="margin-top: 1rem;flex-grow:1">
            <h5>Category: <strong id="category"></strong></h5>
        </div>
        <div class="flex-horizontal align-center" style="margin-top: 1rem;flex-grow:1">
            <span>Date Created:</span>
            <strong  style="margin-left: 0.3rem;">${blog_data.date_created}</strong>
        </div>
    </div>
    <div class="flex-vertical align-center">
        <div class="width-full flex-horizontal align-center blog-bar-container" style="flex-grow:1">
            <div class="flex-vertical">
                <span>Relevancy: </span>
            </div>
            
            <div class="bar-container">
                <div class="bar-fill" style="width: ${relevancy_percentage};background-color:blue">
                </div>
            </div>
            <div class="flex-vertical align-center">
                <strong>${blog_data.average_relevancy_rating}/${rating_limit}</strong>
            </div>
        </div>
        <div class="flex-horizontal align-center" style="margin-top: 1rem;flex-grow:1">
            <span>Number of comments:</span>
            <strong  style="margin-left: 0.3rem;">${comment_ids.length}</strong>
        </div>
        <div class="flex-horizontal align-center" style="margin-top: 1rem;flex-grow:1">
            <span>Date Modified:</span>
            <strong  style="margin-left: 0.3rem;">${blog_data.date_modified}</strong>
        </div>
    </div>
    <div class="flex-vertical align-center">
        <div class="width-full flex-horizontal align-center blog-bar-container" style="flex-grow:1">
            <div class="flex-vertical">
                <span>Impression: </span>
            </div>
            
            <div class="bar-container">
                <div class="bar-fill" style="width: ${impression_percentage};background-color:green">
                </div>
            </div>
            <div class="flex-vertical align-center">
                <strong>${blog_data.average_impression_rating}/${rating_limit}</strong>
            </div>
        </div>
        <div class="flex-horizontal align-center" style="margin-top: 1rem;flex-grow:1">
            <h5>Views: <strong>${blog_data.views}</strong></h5>
        </div>
        <div class="flex-horizontal align-center" style="margin-top: 1rem;flex-grow:1">
            <span style="margin-left: 0.3rem;">??? ratings: <strong>${blog_data.number_ratings}</strong></span>
            
        </div>
    </div>
    `
    $("#top-blog-info-container").insertAdjacentHTML("beforeend", top_blog_info_dom_string)
    $("#category").insertAdjacentText("beforeend", categories_hashmap[blog_data.category_id])
    $("#author_hyperlink").onclick = () => {change_page_state(`/profile/${blog_data.username}`)}
    if (auth_info.user_id === blog_data.author_user_id){
        $("#edit-blog-btn").onclick = () => {change_page_state(`/edit_blog/${blog_data.blog_id}`)};
    }else if(auth_info.access_level === 2){
        $('#ban-btn').onclick = () => {ban_blog(blog_data)};


    }else{

        //applies the change page state function to the report button which makes the page change to the report page
        $('#report-blog-btn').onclick = () => { show_report_page(blog_data.blog_id) };
    }
}
let comment_ids = [];
let comments_currently_showing = 0;
let comments_increment = 4;
let gl_blog_id;
let MAX_COMMENT_CHARCOUNT = 2000;



async function ban_blog(blog_data) {
    return fetch(`/api/blog/ban`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(blog_data)
    }).then((result) => result.json())
        .then((result) => {
            return result.code
        });
}

async function submit_blog_rating(rating_data, hcaptcha_response){

    return fetch("/api/blog/submit_rating", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            rating_data: rating_data,
            hcaptcha_response: hcaptcha_response
        }),
    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });
}

async function delete_blog_rating(blog_id) {
    return fetch("/api/blog/delete_rating", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            blog_id: blog_id
        })

    })
        .then((result) => result.json())
        .then((result) => {
            return result
        })
}

async function get_posted_blog_rating(blog_id) {
    return fetch(`/api/blog/${blog_id}/get_posted_rating`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },

    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });
}

async function parse_posted_blog_rating(blog_data) {
    let res = await get_posted_blog_rating(blog_data.blog_id)
    console.log(res)
    switch (res.code) {
        case 1: {
            let rating_data = res.data
            console.log(rating_data)
            // Already rated by user
            let controversial_percentage = `${(rating_data.controversy_rating / rating_limit * 100).toFixed(2)}%`;
            let relevancy_percentage = `${(rating_data.relevancy_rating / rating_limit * 100).toFixed(2)}%`;
            let impression_percentage = `${(rating_data.impression_rating / rating_limit * 100).toFixed(2)}%`;
            let domstring = `
            <h4> You already rated this blog </h4>
            <div class="blog-tile-ratings-grid width-full">
                <div class="flex-vertical align-center">
                    <span>Controversial: </span>
                </div>
                
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${controversial_percentage};background-color:red">
                    </div>
                </div>
                <div class="flex-vertical align-center">
                    <strong>${rating_data.controversy_rating}/${rating_limit}</strong>
                </div>

                <div class="flex-vertical align-center">
                    <span>Relevancy: </span>
                </div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${relevancy_percentage};background-color:blue">
                    </div>
                </div>
                <div class="flex-vertical align-center">
                    <strong>${rating_data.relevancy_rating}/${rating_limit}</strong>
                </div>

            
            
                <div class="flex-vertical align-center">
                    <span>Impression: </span>
                </div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${impression_percentage};background-color:green">
                    </div>
                </div>
                <div class="flex-vertical align-center">
                    <strong>${rating_data.impression_rating}/${rating_limit}</strong>
                </div>
            </div>
            <button id="delete-rating-btn" style="margin-top: 0.3em" class="btn btn-outline-danger profile-control-button flex-horizontal align-center">
                <span class="material-icons">
                    delete
                </span>
                Delete rating
            </button>
            `
            $("#rating-container").insertAdjacentHTML("beforeend", domstring)
            $("#delete-rating-btn").onclick = () => { on_delete_rating_click(gl_blog_id) }
            break;
        }
        case 2: {
            // Not logged in
            break;
        }
        case 3: {
            let rateblog = `
            <h5>Please rate this blog</h5>
       
            <div class="slidecontainer">
                <div class="flex-vertical align-left" style="float:left;width:60%;">
                    <strong style="font-size: larger">Controversy:</strong>
                </div>
                <div class="flex-vertical align-right" style="float:right;width:40%;">
                    <font size="-1.5">How strongly do you feel that anything discussed was controversial?</font>
                </div>
                <input style="" type="range" min="0" max="10" value="5" class="ratingslider" id="controversyRange" oninput="this.nextElementSibling.value = this.value">
                <output style="width: 4%; text-align: center;font-weight: bolder">5</output>
                
            </div>
            <div class="slidecontainer">
                <div class="flex-vertical align-left" style="float:left;width:60%">
                    <strong style="font-size: larger">Relevancy:</strong>
                </div>
                <div class="flex-vertical align-right" style="float:right,width:40%">
                    <font size="-1.5">How strongly do you feel that everything in the blog was relevant to the title or category?</font>
                </div>
                <input style="" type="range" min="0" max="10" value="5" class="ratingslider" id="relevancyRange" oninput="this.nextElementSibling.value = this.value">
                <output style="width: 4%; text-align: center;font-weight: bolder;">5</output>
                
            </div>
            <div class="slidecontainer">
                <div class="flex-vertical align-left" style="float:left;width:60%">
                    <strong style="font-size: larger">Impression:</strong>
                </div>
                <div class="flex-vertical align-right" style="float:right,width:40%">
                    <font size="-1.5">How likely are you to recommend this blog to others?</font>
                </div>
                <input style="" type="range" min="0" max="10" value="5" class="ratingslider" id="impressionRange" oninput="this.nextElementSibling.value = this.value">
                <output style="width: 4%; text-align: center;font-weight: bolder;">5</output>
                
            </div>
            
            <button id="ratingSubmit" style="margin-top: 0.8em" class="btn btn-outline-primary profile-control-button flex-horizontal align-center">
                Submit
            </button>
            `
     
            let banned = await(check_user_banned(auth_info.user_id))
            if(auth_info.user_id == blog_data.author_user_id){

                $("#rating-container").insertAdjacentHTML("beforeend", `<h3>You can't rate your own blog!</h3>`);
            } else if(auth_info.user_banned === true){
                $("#rating-container").insertAdjacentHTML("beforeend", `<h3>You are banned from rating any blogs!</h3>`);
                
            }
            else {
                $("#rating-container").insertAdjacentHTML("beforeend", rateblog)
                $("#ratingSubmit").onclick = () => { on_submit_blog_rating_click(blog_data.blog_id) }
            }


            break;
        }
    }
}

async function on_delete_rating_click(blog_id) {
    let res_from_delete_rating = await delete_blog_rating(blog_id);
    if (res_from_delete_rating.code != 1) {
        return null;
    }
    location.reload();
}


async function on_submit_blog_rating_click(blog_id){
    $("#rating-container").insertAdjacentHTML('beforebegin', spinner_domstring);

    let rating_data = {
        blog_id: blog_id,
        controversy_rating: Number($("#controversyRange").value),
        relevancy_rating: Number($("#relevancyRange").value),
        impression_rating: Number($("#impressionRange").value)

    }
    // let hcaptcha_widget = hcaptcha.render($("body"), {
    //     size: "invisible",
    //     sitekey: "28dd5d54-e402-445c-ac00-541d3e9cadc3"
    // })
    // let hcaptcha_result = await hcaptcha.execute(hcaptcha_widget, {
    //     async: true
    // })
    let res_from_submit_rating = await submit_blog_rating(rating_data, /*hcaptcha_result.response*/ "")
    $(".lds-roller").remove();
    // If non valid, then user must have gone out of their way to do this, like use console, no need to show any error
    if (res_from_submit_rating.code != 1) {
        return null
    }

    location.reload();
}

async function render_comments_prereq(){
    comments_currently_showing = 0;
    let page_container = $(".page-container");
    let dom_template = `
    <div class="flex-vertical width-full full-comments-container">
        <h4 style="text-align: center">Comments</h4>
        
        <form class="comment flex-vertical" id="new_comment_form" style="align-items: flex-end">
            <div class="width-full">
                <h5 style="text-align: start;">
                    New comment 
                    
                </h5>
                <h6 style="flex-grow:1; text-align: end;">
                    Character count: 
                    <strong id="new-comment-charcount">0/${MAX_COMMENT_CHARCOUNT}</strong>
                </h6>
                
            </div>
            
            <textarea class="form-control"></textarea>
            <div class="invalid-feedback">
                Your comment is too long or empty.
            </div>
            <button type="submit" class="flex-horizontal align-center btn 
            btn-outline-primary" id="post_new_comment_btn">
                <span class="material-icons">
                post_add
                </span>
                Post
            </button>
        </form>
        <div class="comments-container">
            
        </div>
        <span class="width-full flex-horizontal" style="justify-content:end; text-align:end;">
            Comments shown:
            <strong id="comments_shown" style="margin-left:2px"></strong>
        </span>

    </div>
    `
    page_container.insertAdjacentHTML("beforeend", dom_template)
    if (comments_currently_showing < comment_ids.length) {
        let show_more_domstring = `
        <button class="btn btn-outline-primary flex-horizontal align-center" id="comments-show-more-btn"
        style="max-width: fit-content; margin:auto;">
            <span class="material-icons">
                arrow_circle_down
            </span>

            Show more
        </button>
        `;
        $(".comments-container").insertAdjacentHTML("afterend", show_more_domstring);

        $("#comments-show-more-btn").onclick = () => { fetch_and_render_next_comments() }
    }
    $("#new_comment_form").onsubmit = (ev) => {
        ev.preventDefault();
        on_new_comment_post_click();
    }
    $("#new_comment_form textarea").oninput = (ev) => {
        
        let text = ev.target.value;
        $("#new-comment-charcount").innerHTML = `${text.length}/${MAX_COMMENT_CHARCOUNT}`
    }
    fetch_and_render_next_comments()
}

async function on_new_comment_post_click(){
    if(auth_info.user_banned === true){
        alert("You are banned from creating any content.")
        return null
    }
    let comment_text = $("#new_comment_form textarea").value;
    if (comment_text.length < 1 || comment_text.length >= 2000){
        validate_element("#new_comment_form textarea", "is-invalid")
        return null;
    }
    
    reset_validation_classes(["#new_comment_form textarea"])
    $("#post_new_comment_btn").insertAdjacentHTML('beforebegin', spinner_domstring);
    // let hcaptcha_widget = hcaptcha.render($("body"), {
    //     size: "invisible",
    //     sitekey: "28dd5d54-e402-445c-ac00-541d3e9cadc3"
    // })
    // let hcaptcha_result = await hcaptcha.execute(hcaptcha_widget, {
    //     async: true
    // })
    
    let temp = await post_comment(gl_blog_id, comment_text, /*hcaptcha_result.response*/ "")
    $(".lds-roller").remove();
    if(temp.code != 1){ return null };
    location.reload();
}

async function insert_comment(comment_data){
    let comment_id = `comment_${comment_data.comment_id}`
    let comment_template = `
    <div class="comment flex-horizontal" id="${comment_id}">
        
        <img src="/images/avatar_${comment_data.avatar_image_id}.webp" alt="profile avatar">
        <div class="flex-vertical" style="margin-left: 0.8rem;">
            <div class="flex-horizontal" style="padding-left: 0.5rem; justify-content: flex-start; align-items:center">
                <button style="font-weight: bolder" class="comment_author_hyperlink hoverable-text">${comment_data.username}</button>
                <time datetime=${comment_data.datetime_created}>${new Date(comment_data.datetime_created).toLocaleString()}</time>
            </div>
            <p class="comment-body" style="margin-bottom:0"></p>
        </div>
        
    </div>
    `
    $(".comments-container").insertAdjacentHTML("beforeend", comment_template)
    $(`#${comment_id} .comment-body`).insertAdjacentText("beforeend", comment_data.comment_text);
    $(`#${comment_id} .comment_author_hyperlink`).onclick = () => {change_page_state(`/profile/${comment_data.username}`)}
    if (comment_data.user_id != auth_info.user_id) {return null}
    let own_comment_controls = `
    <div class="flex-horizontal align-items" style="flex-grow:1; justify-content:flex-end">
        <span class="material-icons comment-control-button delete-comment" style="color:#dc3545">
        delete
        </span>
    </div>
    `
    $(`#${comment_id}`).insertAdjacentHTML("beforeend", own_comment_controls)
    $(`#${comment_id} .delete-comment`).onclick = async function(){
        let temp = await delete_comment(comment_data.comment_id)
        if(temp.code != 1){return null}
        location.reload()
    }
    
}

async function fetch_and_render_next_comments(){
    if (comments_currently_showing >= comment_ids.length) {
        $("#comments_shown").innerHTML = `${comments_currently_showing}/${comment_ids.length}`;
        return null;
    }
    let temp = await get_comment_content(comment_ids.slice(comments_currently_showing, comments_currently_showing + comments_increment));
    if (temp.code != 1) {
        return null
    }
    let comments_data = temp.data;
    console.log(comments_data)
    comments_data.forEach((comment_data, index) => {
        insert_comment(comment_data)
    })
    
    comments_currently_showing = Math.min(comments_currently_showing + comments_increment, comment_ids.length);
    $("#comments_shown").innerHTML = `${comments_currently_showing}/${comment_ids.length}`;
    // If all of the authored blogs are shown, then we should remove the "show more" blogs button.
    temp = $("#comments-show-more-btn")
    if (temp != null && comments_currently_showing == comment_ids.length) {
        temp.remove();
    }
}

// submit_blog_rating({
//     controversy_rating: Math.floor(Math.random() * 10),
//     relevancy_rating: Math.floor(Math.random() * 10),
//     impression_rating: Math.floor(Math.random() * 10),
//     blog_id: 1
// })
// delete_blog_rating(1)
async function render_view_blog(blog_id) {
    let temp = await get_blog(blog_id)
    if (temp.code != 1) {
        return null;
    }

    let blog_data = temp.blog_data;
    gl_blog_id = blog_data.blog_id
    blog_data.date_created = convert_iso_date(new Date(blog_data.date_created))
    blog_data.date_modified = convert_iso_date(new Date(blog_data.date_modified))
    let edit_button_domstring = `
        <button id="edit-blog-btn" class="btn btn-outline-primary profile-control-button flex-horizontal align-center">
            <span class="material-icons">
                edit
            </span>
            Edit
        </button>
    `;
    let report_button_domstring = `
        <button class="btn btn-outline-danger profile-control-button flex-horizontal align-center" id="report-blog-btn">
            <span class="material-icons">
                gavel
            </span>
            Report
        </button>
    `;
    let ban_button_domstring = `
            <button class="btn btn-outline-danger profile-control-button flex-horizontal align-center" id="ban-btn" type="button" tabindex="0">
                <span class="material-icons">
                    dangerous
                </span>
                Ban
            </button>
            `;
    let view_blog_dom_string = `
    <div id="blog-buttons-container" class="flex-horizontal align-end width-full">
       ${auth_info.user_id === blog_data.author_user_id ? edit_button_domstring : ""}
       ${auth_info.access_level==2 ? ban_button_domstring : ""}
       ${auth_info.user_id != blog_data.author_user_id && auth_info.access_level==1 ? report_button_domstring : ""}
    </div>
    <div id="top-blog-info-container">
        
    </div>
    <div class="page-container width-full flex-vertical align-center">
        <div class="blog-container width-full">
            <h2 style="text-align: center" id="blog-title"></h2>
            
            <div>
                <p id="blog-body"></p>
            </div>
            
        </div>
        <div class="flex-vertical align-center width-full" id="rating-container">
            
        </div>
        
        
    </div>
    
    `

    $("#view-blog-container").insertAdjacentHTML("beforeend", view_blog_dom_string);
    $("#blog-title").insertAdjacentText("beforeend", blog_data.blog_title)
    $("#blog-body").insertAdjacentText('beforeend', blog_data.blog_body.text)
    temp = await get_comment_ids(blog_id);
    comment_ids = temp.data;

    parse_posted_blog_rating(blog_data)
    insert_top_blog_info(blog_data)
    
    render_comments_prereq();
    
}

async function post_comment(blog_id, comment_text, hcaptcha_response) {
    return fetch("/api/blog/post_comment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            blog_id: blog_id,
            comment_text: comment_text,
            hcaptcha_response: hcaptcha_response
        }),
    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });
}

async function edit_comment(comment_id, comment_text) {
    return fetch("/api/blog/edit_comment", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            comment_id: comment_id,
            comment_text: comment_text,

        }),
    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });
}

async function delete_comment(comment_id) {
    return fetch("/api/blog/delete_comment", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            comment_id: comment_id,


        }),
    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });
}

async function get_comment_ids(blog_id) {
    return fetch(`/api/blog/${blog_id}/get_comment_ids`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });

}

async function get_comment_content(comment_ids) {
    return fetch(`/api/blog/get_comments/${JSON.stringify(comment_ids)}`, {
        method: "GET",
        headers: {

            "Content-Type": "application/json",

        }
    })
    .then((result) => result.json())
        .then((result) => {
            return result
        });
}

