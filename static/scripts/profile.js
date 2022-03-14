let profile_edit_state = false;
let profile_info = {};
let blogs_increment = 2;
let currently_showing = 0;
async function get_public_profile_info(username){
    return fetch(`/api/profile/${username}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    }).then((result) => result.json())
    .then((result) => {
        return result
    });
}

async function submit_profile_edit(){
    let personal_description = $("#profile-description-text").value;
    profile_info.personal_description = personal_description;
    return fetch(`/api/edit/profile/${profile_info.username}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(profile_info)
    }).then((result) => result.json())
    .then((result) => {
        return result.code
        
    });
}


async function toggle_edit_state(){
    profile_edit_state = !profile_edit_state;
    if (profile_edit_state){
        let edit_btn = delete_dom_children("#edit-btn")
        let edit_btn_domstring = `
            <span class="material-icons">
            save
            </span>
            Save
        `;
        edit_btn.insertAdjacentHTML("beforeend", edit_btn_domstring);
        let description_element = $("#profile-description-text");
        description_element.remove();
        let description_domstring = `
        <textarea class="profile-description-box form-control" id="profile-description-text">
        </textarea>
        `;

        $("#personal-description-container").insertAdjacentHTML("beforeend", description_domstring);
        $("#profile-description-text").value = profile_info.personal_description;
    }
    else{
        let code = await submit_profile_edit();
        if (code === 1){
            location.reload();
        }
        let edit_btn = delete_dom_children("#edit-btn")
        let edit_btn_domstring = `
            <span class="material-icons">
                edit
            </span>
            Edit
        `;
        edit_btn.insertAdjacentHTML("beforeend", edit_btn_domstring);
        let description_element = $("#profile-description-text");
        description_element.remove();
        let description_domstring = `
        <div id="profile-description-text" class="profile-description-box">
            ${profile_info.personal_description}
        </div>
        `
        $("#personal-description-container").insertAdjacentHTML("beforeend", description_domstring);
    }
}


async function ban(){
    return fetch(`/api/profile/${profile_info.username}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(profile_info)
    }).then((result) => result.json())
    .then((result) => {
        return result.code
        
    });
}

async function fetch_and_render_next_blog_tiles(){
    if (currently_showing >= profile_info.authored_blogs.length){
        $("#blogs-shown").innerHTML = `${currently_showing}/${profile_info.authored_blogs.length}`;
        return null;
    }
    let temp = await get_certain_blog_tiles_data(profile_info.authored_blogs.slice(currently_showing, currently_showing + blogs_increment));
    if (temp.code != 1){
        return null
    }
    let blog_tiles = temp.data;
    console.log(blog_tiles)
    let authored_blogs_container = $("#authored-blogs-container");
    blog_tiles.forEach((blog_tile, index) => {
        let blog_tile_dom_string = get_blog_tile(
            blog_tile.username,
            blog_tile.date_created,
            blog_tile.word_count,
            blog_tile.category,
            blog_tile.blog_title,
            blog_tile.blog_id,
            blog_tile.avatar_image_id,
            blog_tile.views
        )
        authored_blogs_container.insertAdjacentHTML("beforeend", blog_tile_dom_string);
    })
    currently_showing = Math.min(currently_showing + blogs_increment, profile_info.authored_blogs.length);
    $("#blogs-shown").innerHTML = `${currently_showing}/${profile_info.authored_blogs.length}`;
    // If all of the authored blogs are shown, then we should remove the "show more" blogs button.
    temp = $("#authored-blogs-show-more-btn")
    if (temp != null && currently_showing == profile_info.authored_blogs.length){
        temp.remove();
    }
}

async function insert_profile_info(){
    let profile_control_container = $("#profile-control-container");
    // This means that the user is on their own profile, so should add edit button
    if (auth_info.username === profile_info.username) {
        let logout_button_domstring = `
        <button class="btn btn-outline-danger profile-control-button flex-horizontal align-center" id="logout-btn" type="button" tabindex="0">
            <span class="material-icons">
                logout
            </span>
            Log out
        </button>
        `;
        profile_control_container.insertAdjacentHTML("beforeend", logout_button_domstring);
        $("#logout-btn").onclick = logout;
        let edit_button_domstring = `
        <button id="edit-btn" class="btn btn-outline-primary profile-control-button flex-horizontal align-center">
            <span class="material-icons">
                edit
            </span>
            Edit
        </button>
        `;
        profile_control_container.insertAdjacentHTML("beforeend", edit_button_domstring);
        $('#edit-btn').onclick = toggle_edit_state;
    }
    else{
        if(auth_info.access_level === 1){
            let report_button_domstring = `
            <button class="btn btn-outline-danger profile-control-button flex-horizontal align-center" id="report-btn">
                <span class="material-icons">
                    gavel
                </span>
                Report
            </button>
            `;
            profile_control_container.insertAdjacentHTML("beforeend", report_button_domstring);
            $('#report-btn').onclick = () => {show_user_report_page(profile_info.user_id)};
        }else if(auth_info.access_level === 2){
            let ban_button_domstring = `
            <button class="btn btn-outline-danger profile-control-button flex-horizontal align-center" id="ban-btn" type="button" tabindex="0">
                <span class="material-icons">
                    delete
                </span>
                Ban
            </button>
            `;
            profile_control_container.insertAdjacentHTML("beforeend", ban_button_domstring);
            $('#ban-btn').onclick = ban;
        }
    }
    // Profile text field initialization
    $("#username-text").innerHTML = `Username: ${profile_info.username}`
    $("#date-created").innerHTML = `Date created: ${profile_info.date_created}`
    $("#date-last-accessed").innerHTML = `Date last accessed: ${profile_info.date_last_accessed}`
    $("#avatar-img").setAttribute("src", `/images/avatar_${profile_info.avatar_image_id}.webp`);
    $("#profile-description-text").innerHTML = profile_info.personal_description;
    fetch_and_render_next_blog_tiles();
    if (currently_showing < profile_info.authored_blogs.length){
        let show_more_domstring = `
        <button class="btn btn-outline-primary flex-horizontal align-center" id="authored-blogs-show-more-btn">
            <span class="material-icons">
                arrow_circle_down
            </span>

            Show more
        </button>
        `;
        $("#authored-blogs-container").insertAdjacentHTML("beforeend", show_more_domstring);
        
        $("#authored-blogs-show-more-btn").onclick = () => {fetch_and_render_next_blog_tiles()}
    }
    
}


async function profile_main(username){
    let profile_temp = await get_public_profile_info(username);
    profile_info = profile_temp.data;
    console.log(profile_info);
    currently_showing = 0;
    // This happens when the requested account exists
    if (profile_temp.code === 1){
        profile_info.username = username;
        insert_profile_info(profile_info);
    }
    // This happens when the requested account does not exist
    else{
        let main = delete_dom_children("main");
        main.insertAdjacentHTML("beforeend", `<h2 style="text-align: center;">No account with username: ${username}, exists.</h2>`);
    }

    
}

let user_reporting_catergories = ["Numerous hateful blogs", "Inappropriate description", "Inappropriate profile picture"]

async function show_user_report_page(user_id){
    //html stuff for displaying the catergories for the drop down menu
    let user_report_category_options_dom_string = ``
    user_reporting_catergories.forEach((category, index) => {
        user_report_category_options_dom_string += `
        <option value=${index}>${category}</option>
        `
    })
    //html stuff here
    let report_domstring = `
    <div class="modal fade" id="big_user_Report" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Report Form</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>We take harmful content reports very seriously. 
                    Your report will be manually reviewed by an administrator.
                    Please provide as much information as possible to make it easier to make our judgement. 
                        <br>
                    
                        
                        
                    </p>
                
                    <h4>Please select why do you think this user is harmful:</h4>
                    <select class="form-select" id="report-category">
                        ${user_report_category_options_dom_string}
                    </select>
                    <h4>Please provide more details (what specifically about the user in harmful):</h4>
                    <textarea id="edit-report-body" class="form-control" maxlength = "2000"></textarea>
                    <div class="invalid-feedback" id="invalid-details">
                        placeholder
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary">Submit report</button>
                </div>
            </div>
        </div>
    </div>
    `
    let body = $("body");
    body.insertAdjacentHTML("beforeend",report_domstring);
    var myModal = new bootstrap.Modal($("#big_user_Report"), {})
    myModal.show();
    const submitBtn = document.querySelector(".modal-footer button");
    submitBtn.onclick = () => {submit_user_report(user_id, myModal)};
}

async function submit_user_report(user_id, myModal){
    let identifier_class = $("#edit-report-body").value != "" ? "is-valid" : "is-invalid";
    if (identifier_class === "is-invalid"){
        $("#invalid-details").innerHTML = "Please give some details";
        valid_element("#edit-report-body", identifier_class);
    }else{
        let report_data = {
            user_id: user_id,
            report_reason: reporting_catergories[$("#report-category").selectedIndex],
            report_body: $("#edit-report-body").value
        }
        $("#edit-report-body").value = "";
        valid_element("#edit-report-body", null);
        myModal.hide();
        return fetch("/api/user/report",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(report_data)
        }).then((result) => result.json())
        .then((result) => {
            return result
        })

    }
}