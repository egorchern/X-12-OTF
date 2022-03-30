async function get_all_report_blogs_data(){
    return fetch("/api/blogs/report_get_reports",{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then((result) => result.json())
        .then((result) =>{
            return result
        });
}
async function get_all_report_users_data(){
    return fetch("/api/user/report_get_reports",{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then((result) => result.json())
        .then((result) =>{
            return result
        });
}
function insert_blog_reports(
    report_data, identifier
){
    let blog_report_domstring = `
    <div class="report-tile animated__animated animated__fadeIn width-full grid-5-cols" id="blog-report-tile-${report_data.blog_id}" onclick="change_page_state('/blog/${report_data.blog_id}')">
            
    <span class="flex-horizontal align-center" style="text-align: center">${report_data.blog_id}</span>
    <span class="flex-horizontal align-center" style="text-align: center">${report_data.report_date}</span>
    <span class="flex-horizontal align-center" style="text-align: center">${report_data.report_reason}</span>
    <span class="flex-horizontal align-center" style="text-align: center">${report_data.report_count}</span>
    <span class="flex-horizontal align-center" style="text-align: center">${report_data.report_body}</span>
            
    </div>
    `
    $(identifier).insertAdjacentHTML("beforeend", blog_report_domstring);
}

function insert_user_reports(
    report_data, identifier
){
    let user_report_domstring = `
    <div class="report-tile animated__animated animated__fadeIn width-full grid-5-cols" id="user-report-tile-${report_data.user_id}" onclick="change_page_state('/profile/${report_data.username}')">
        <span class="flex-horizontal align-center" style="text-align: center">${report_data.user_id}</span>
        <span class="flex-horizontal align-center" style="text-align: center">${report_data.report_date}</span>
        <span class="flex-horizontal align-center" style="text-align: center">${report_data.report_reason}</span>
        <span class="flex-horizontal align-center" style="text-align: center">${report_data.report_count}</span>
        <span class="flex-horizontal align-center" style="text-align: center">${report_data.report_body}</span>
            
    </div>
    `
    $(identifier).insertAdjacentHTML("beforeend", user_report_domstring);
}

function get_nearest_date(OldDate, NewDate){
    if(parseInt(OldDate.slice(6,10))<parseInt(NewDate.slice(6,10))){
        return true
    }
    if(parseInt(OldDate.slice(6,10))>parseInt(NewDate.slice(6,10))){
        return false
    }
    else{
        if(parseInt(OldDate.slice(3,5))<parseInt(NewDate.slice(3,5))){
            return true
        }if(parseInt(OldDate.slice(3,5))>parseInt(NewDate.slice(3,5))){
            return false
        }else{
            if(parseInt(OldDate.slice(0,2))<parseInt(NewDate.slice(0,2))){
                return true
            }if(parseInt(OldDate.slice(0,2))>parseInt(NewDate.slice(0,2))){
                return false
            }else{
                return true
            }
        }
    }
}

async function get_all_blog_reports(){
    let return_dom_string = ``
    let temp = await get_all_report_blogs_data();
    
    if (temp.code != 1) {
        return { dom_string: "" }
    }
    let report_tiles_data = []
    let all_blog_tiles_data = temp.data
    for(let i=0; i<all_blog_tiles_data.length; i++){
        let found = false
        for(let j=0; j<report_tiles_data.length;j++){
            if(report_tiles_data[j].blog_id === all_blog_tiles_data[i].blog_id){
                if(get_nearest_date(report_tiles_data[j].report_date,all_blog_tiles_data[i].report_date)){
                    report_tiles_data[j].report_date = all_blog_tiles_data[i].report_date
                    report_tiles_data[j].report_body = all_blog_tiles_data[i].report_body
                }
                if(!report_tiles_data[j].report_reason.includes(all_blog_tiles_data[i].report_reason)){
                    report_tiles_data[j].report_reason+=", "+all_blog_tiles_data[i].report_reason
                }
                report_tiles_data[j].report_count++
                found = true
            }
        }
        if(found == false){
            let report_data = {
                blog_id: all_blog_tiles_data[i].blog_id,
                report_date: all_blog_tiles_data[i].report_date,
                report_reason: all_blog_tiles_data[i].report_reason,
                report_count: 1,
                report_body: all_blog_tiles_data[i].report_body
            }
            report_tiles_data.push(report_data)
        }
    }
    report_tiles_data.forEach((blog_data, index) => {
        insert_blog_reports(blog_data,"#report_blog_tiles")
    })
    return { dom_string: return_dom_string, data: all_blog_tiles_data }
}

async function get_all_user_reports(){
    let return_dom_string = ``
    let temp = await get_all_report_users_data();
    console.log(temp)
    if (temp.code != 1) {
        return { dom_string: "" }
    }
    let report_tiles_data = []
    let all_user_tiles_data = temp.data
    for(let i=0; i<all_user_tiles_data.length; i++){
        let found = false
        for(let j=0; j<report_tiles_data.length;j++){
            if(report_tiles_data[j].user_id === all_user_tiles_data[i].user_id){
                if(get_nearest_date(report_tiles_data[j].report_date,all_user_tiles_data[i].report_date)){
                    report_tiles_data[j].report_date = all_user_tiles_data[i].report_date
                    report_tiles_data[j].report_body = all_user_tiles_data[i].report_body
                }
                if(!report_tiles_data[j].report_reason.includes(all_user_tiles_data[i].report_reason)){
                    report_tiles_data[j].report_reason+=", "+all_user_tiles_data[i].report_reason
                }
                report_tiles_data[j].report_count++
                found = true
            }
        }
        if(found == false){
            let report_data = {
                user_id: all_user_tiles_data[i].user_id,
                report_date: all_user_tiles_data[i].report_date,
                report_reason: all_user_tiles_data[i].report_reason,
                report_count: 1,
                report_body: all_user_tiles_data[i].report_body,
                username: all_user_tiles_data[i].username
            }
            report_tiles_data.push(report_data)
        }
    }
    console.log(report_tiles_data)
    report_tiles_data.forEach((user_data, index) => {
        insert_user_reports(user_data,"#report_user_tiles")
    })
    return { dom_string: return_dom_string, data: all_user_tiles_data }
}
