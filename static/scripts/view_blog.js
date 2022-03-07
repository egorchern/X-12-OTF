function get_top_blog_info(blog_data){
    if(!("controversial_rating" in blog_data)){
        blog_data.controversial_rating = Math.random() * rating_limit
        blog_data.relevancy_rating = Math.random() * rating_limit
        blog_data.impression_rating = Math.random() * rating_limit
    }
    blog_data.controversial_rating = Number(blog_data.controversial_rating.toFixed(1))
    blog_data.relevancy_rating = Number(blog_data.relevancy_rating.toFixed(1))
    blog_data.impression_rating = Number(blog_data.impression_rating.toFixed(1))
    let controversial_percentage = `${(blog_data.controversial_rating / rating_limit * 100).toFixed(2)}%`;
    let relevancy_percentage = `${(blog_data.relevancy_rating / rating_limit * 100).toFixed(2)}%`;
    let impression_percentage = `${(blog_data.impression_rating / rating_limit * 100).toFixed(2)}%`;
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
                <strong>${blog_data.controversial_rating}/${rating_limit}</strong>
            </div>
        </div>
        <div class="flex-horizontal align-center" style="margin-top: 1rem;flex-grow:1">
            <h5>Category: <strong>${blog_data.category}</strong></h5>
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
                <strong>${blog_data.relevancy_rating}/${rating_limit}</strong>
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
                <strong>${blog_data.impression_rating}/${rating_limit}</strong>
            </div>
        </div>
        <div class="flex-horizontal align-center" style="margin-top: 1rem;flex-grow:1">
            <h5>Views: <strong>${blog_data.views}</strong></h5>
        </div>
        <div class="flex-horizontal align-center" style="margin-top: 1rem;flex-grow:1">
            <span style="margin-left: 0.3rem;">Average Retention:</span>
            
        </div>
    </div>
    `
    return top_blog_info_dom_string
}

async function render_view_blog(blog_id){
    let temp = await get_blog(blog_id)
    if (temp.code != 1){
        return null;
    }
    console.log(temp)
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
        <button id="report-blog-btn" class="btn btn-outline-danger profile-control-button flex-horizontal align-center">
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
        ${get_top_blog_info(blog_data)}
    </div>
    <div class="page-container width-full flex-vertical align-center">
        <div class="blog-container width-full">
            <h2 style="text-align: center">${blog_data.blog_title}</h2>
            
            <div id="blog-body">
                <p>${blog_data.blog_body.text}</p>
            </div>
        </div>
    </div>
    
    `
    $("#view-blog-container").insertAdjacentHTML("beforeend", view_blog_dom_string);
    if (auth_info.user_id === blog_data.author_user_id){
        $("#edit-blog-btn").onclick = () => {change_page_state(`/edit_blog/${blog_id}`)};
    }else{
        //applies the change page state function to the report button which makes the page change to the report page
        $('#report-blog-btn').onclick = () => {show_report_page(blog_id)};
    }
    $("#author_hyperlink").onclick = () => {change_page_state(`/profile/${blog_data.username}`)}
}


//submit_report(6, "Test", "Some reason")