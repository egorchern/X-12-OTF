async function render_view_blog(blog_id){
    let temp = await get_blog(blog_id)
    if (temp.code != 1){
        return null;
    }
    let blog_data = temp.blog_data;
    console.log(blog_data);
    let edit_button_domstring = `
        <button id="edit-blog-btn" class="btn btn-outline-primary profile-control-button flex-horizontal align-center">
            <span class="material-icons">
                edit
            </span>
            Edit
        </button>
    `;
    let report_button_domstring = `
        <button class="btn btn-outline-danger profile-control-button flex-horizontal align-center">
            <span class="material-icons">
                gavel
            </span>
            Report
        </button>
    `;
    let view_blog_dom_string = `
    <div id="blog-buttons-container" class="flex-horizontal align-end">
       ${auth_info.user_id === blog_data.author_user_id ? edit_button_domstring : ""}
       ${auth_info.user_id != blog_data.author_user_id ? report_button_domstring : ""}
    </div>
    <div id="top-blog-info-container">
        <span>Some blog info will be here.</span>
    </div>
    <div class="page-container flex-vertical align-center">
        <div class="blog-container width-full">
            <h4 style="text-align: center">${blog_data.category}</h4>
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
    }
}