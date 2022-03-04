let catergories = ['Promoting violence','Hateful speech']

//puts all the html elements onto the page
async function show_report_page(blog_id){
    //get the blog data 
    let temp = await get_blog(blog_id)
    if (temp.code != 1){
        return null;
    }
    let blog_data=temp.blog_data
    //html stuff for displaying the catergories for the drop down menu
    let category_options_dom_string = ``
    categories.forEach((category, index) => {
        category_options_dom_string += `
        <option value=${index}>${category}</option>
        `
    })
    //html stuff here
    let report_domstring = `
        <div class = "flex-horizontal align-center" style = "margin-top: 1rem;flex-grow:1">
            <h1>Report Form</h1>
        </div>
        <div class = "flex-horizontal align-center" style="margin-top: 1rem;flex-grow:1">
            <h5>Blog id: ${blog_data.blog_id}</h5>
        </div>
        <div class = "flex-horizontal align-center" style="margin-top: 1rem;flex-grow:1">
            <h5>Author username: ${blog_data.author_user_id}</h5>
        </div>
        <select class="form-select" id="report-category">
            ${category_options_dom_string}
        </select>
        <textarea id="edit-report-body" class="form-control">

        </textarea>
        <button class = "btn btn-outline-primary profile-control-button flex-horizontal align-center", id = "submit-report-btn">
            <span>
                Submit
            </span>
        </button>
    `
    //applies the submit report function to the submit button
    $('#submit-report-btn').onclick = () => {submit_report(blog_data.blog_id)};
}

async function submit_report(blog_id){
    return fetch("/api/blog/report",{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            blog_id: blog_id,
            report_reason: categories[$("#report-category").selectedIndex],
            report_body:{
                text: $("#edit-report-body").value
            },
        })
    }).then((result) => result.json())
    .then((result) => {
        return result
    })
}