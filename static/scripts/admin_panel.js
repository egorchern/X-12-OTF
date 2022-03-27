async function get_all_report_blogs_data(){
    return fetch("/api/blogs/report_get_reports",{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then((result) => request.json())
        .then((result) =>{
            return result
        });
}
function insert_blog_reports(
    report_data, identifier
){
    let blog_report_domstring = `
    <div class="report-tile animated__animated__fadeIn" id="blog-report-tile-${report_data.blog_id}" onclick="change_page_state('/blog/${report_data.blog_id}')">
            <div class = "report-tile-top">
                <div class = "report-text">${report_data.blog_id}</div>
                <div class = "report-text">${report_data.report_date}</div>
                <div class = "report-text">Encouraging violence</div>
                <div class = "report-text">4</div>
                <div class = "report-description-text">Made violent remarks towards ducks</div>
            </div>
    </div>
    `
    $(identifier).insertAdjacentHTML("beforeend", blog_report_domstring);
}

async function get_all_blog_reports(){
    let return_dom_string = ``
    let temp = await get_all_report_blogs_data();
    
    if (temp.code != 1) {
        return { dom_string: "" }
    }
    
    let all_blog_tiles_data = temp.data
    
    all_blog_tiles_data.sort((a, b) => {
        return b.algorithm_info.score - a.algorithm_info.score
    })
    console.log(all_blog_tiles_data)
    all_blog_tiles_data.forEach((blog_data, index) => {
        insert_blog_reports(blog_data,"#report_blog_tiles")
    })
    return { dom_string: return_dom_string, data: all_blog_tiles_data }
}
