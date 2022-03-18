function insert_top_blog_info(blog_data){
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
            <h5>Tags:</h5>
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
            <span style="margin-left: 0.3rem;">№ ratings: <strong>${blog_data.number_ratings}</strong></span>
            
        </div>
    </div>
    `
    $("#top-blog-info-container").insertAdjacentHTML("beforeend", top_blog_info_dom_string)
    $("#category").insertAdjacentText("beforeend", categories_hashmap[blog_data.category_id])
    $("#author_hyperlink").onclick = () => {change_page_state(`/profile/${blog_data.username}`)}
    if (auth_info.user_id === blog_data.author_user_id){
        $("#edit-blog-btn").onclick = () => {change_page_state(`/edit_blog/${blog_data.blog_id}`)};
    }else{
        //applies the change page state function to the report button which makes the page change to the report page
        $('#report-blog-btn').onclick = () => {show_report_page(blog_data.blog_id)};
    }
}

async function submit_blog_rating(rating_data){
    return fetch("/api/blog/submit_rating", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            rating_data: rating_data,
        }),
    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });
}

async function delete_blog_rating(blog_id){
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

async function get_posted_blog_rating(blog_id){
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

async function parse_posted_blog_rating(blog_id){
    let res = await get_posted_blog_rating(blog_id)
    console.log(res)
    switch (res.code){
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
            $("#delete-rating-btn").onclick = () => {on_delete_rating_click(blog_id)}
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
                    <strong>Controversy:</strong>
                </div>
                <div class="flex-vertical align-right" style="float:right;width:40%;">
                    <font size="-1.5">How strongly do you feel that anything discussed was controversial?</font>
                </div>
                <input style="" type="range" min="0" max="10" value="5" class="ratingslider" id="controversyRange" oninput="this.nextElementSibling.value = this.value">
                <output style="width: 4%; text-align: center;font-weight: bolder">5</output>
                
            </div>
            <div class="slidecontainer">
                <div class="flex-vertical align-left" style="float:left;width:60%">
                    <strong>Relevancy:</strong>
                </div>
                <div class="flex-vertical align-right" style="float:right,width:40%">
                    <font size="-1.5">How strongly do you feel that everything in the blog was relevant to the title, category or tags?</font>
                </div>
                <input style="" type="range" min="0" max="10" value="5" class="ratingslider" id="relevancyRange" oninput="this.nextElementSibling.value = this.value">
                <output style="width: 4%; text-align: center;font-weight: bolder;">5</output>
                
            </div>
            <div class="slidecontainer">
                <div class="flex-vertical align-left" style="float:left;width:60%">
                    <strong>Impression:</strong>
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
            // Not rated by user
            // let new_rating_domstring = `
            // <div class="flex-vertical align-center width-full">
            //     <label for="customRange1" class="form-label">Controversial cut-off</label>
            //     <div class="flex-horizontal align-center width-full">
            //         <input type="range" class="form-range" id="controversial-range" min="0" max="10" step="1">
            //         <strong style="margin-left: 0.1em; text-align: center"></strong>
            //     </div>
            
            // </div>
            // <div class="flex-vertical align-center">
            //     <label for="customRange1" class="form-label">Impression cut-off</label>
            //     <div class="flex-horizontal align-center width-full">
            //         <input type="range" class="form-range" id="impression-range" min="0" max="10" step="1">
            //         <strong style="margin-left: 0.1em; text-align: center"></strong>
            //     </div>
                
            // </div>
            // <div class="flex-vertical align-center">
            //     <label for="customRange1" class="form-label">Relevancy cut-off</label>
            //     <div class="flex-horizontal align-center width-full">
            //         <input type="range" class="form-range" id="relevancy-range" min="0" max="10" step="1">
            //         <strong style="margin-left: 0.1em; text-align: center"></strong>
            //     </div>
                
            // </div>
            // `
            $("#rating-container").insertAdjacentHTML("beforeend", rateblog)
            $("#ratingSubmit").onclick = () => {on_submit_blog_rating_click(blog_id)}
            break;
        }
    }
}

async function on_delete_rating_click(blog_id){
    let res_from_delete_rating = await delete_blog_rating(blog_id);
    if (res_from_delete_rating.code != 1){
        return null;
    }
    location.reload();
}

async function on_submit_blog_rating_click(blog_id){
    let rating_data = {
        blog_id: blog_id,
        controversy_rating: Number($("#controversyRange").value),
        relevancy_rating:Number($("#relevancyRange").value),
        impression_rating:Number($("#impressionRange").value)

    }
    let res_from_submit_rating = await submit_blog_rating(rating_data)
    // If non valid, then user must have gone out of their way to do this, like use console, no need to show any error
    if(res_from_submit_rating.code != 1){
        return null
    }
    
    location.reload();
}

// submit_blog_rating({
//     controversy_rating: Math.floor(Math.random() * 10),
//     relevancy_rating: Math.floor(Math.random() * 10),
//     impression_rating: Math.floor(Math.random() * 10),
//     blog_id: 1
// })
// delete_blog_rating(1)
async function render_view_blog(blog_id){
    let temp = await get_blog(blog_id)
    if (temp.code != 1){
        return null;
    }
    
    let blog_data = temp.blog_data;
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
    let view_blog_dom_string = `
    <div id="blog-buttons-container" class="flex-horizontal align-end width-full">
       ${auth_info.user_id === blog_data.author_user_id ? edit_button_domstring : ""}
       ${auth_info.user_id != blog_data.author_user_id ? report_button_domstring : ""}
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
    
    insert_top_blog_info(blog_data)
    parse_posted_blog_rating(blog_id)
    
}