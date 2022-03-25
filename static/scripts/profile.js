let profile_edit_state = false;
let profile_info = {};
let blogs_increment = 2;
let currently_showing = 0;
let currently_hidden = 0;
// This indicates what is the biggest avatar num. This is until we manage to make image uploads
let max_avatar_number = 10;
let currently_selected_avatar = 0;
async function get_public_profile_info(username) {
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

function convert_iso_date(dt){
    // var _dd = "";
    // var _mm="";
    // var _yy = dt.getFullYear();
    // dt.getDate() <10 ? (_dd='0'+dt.getDate()):(_dd=dt.getDate());
    // (dt.getMonth()+1) <10?(_mm='0'+(dt.getMonth()+1)):(_mm = dt.getDate()+1);
    // let out_dt = `${_dd}/${_mm}/${_yy}`;
    // return out_dt
    return dt.toLocaleDateString()
    
}

function on_edit_avatar_click(avatar_id) {
    if (avatar_id === currently_selected_avatar || avatar_id > max_avatar_number) {
        return null;
    }
    currently_selected_avatar = avatar_id;
    document.querySelectorAll(".profile_edit_avatar").forEach((node, index) => {

        node.classList.remove("selected", "not_selected")
        if (index + 1 === currently_selected_avatar) {
            node.classList.add("selected")
        }
        else {
            node.classList.add("not_selected")
        }
    })
}

async function submit_profile_edit() {
    let personal_description = $("#profile-description-text").value;
    profile_info.personal_description = personal_description;
    profile_info.avatar_image_id = currently_selected_avatar;
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

function get_edit_avatar_domstring() {
    let images = `

    `
    for (let i = 1; i <= max_avatar_number; i++) {
        images += `
       
        <img class="profile_edit_avatar ${profile_info.avatar_image_id === i ? "selected" : "not_selected"}" src="/images/avatar_${i}.webp" alt="avatar number ${i}" onclick="on_edit_avatar_click(${i})"/>
        
        
        `
    }
    let domstring = `
    <div class="flex-horizontal flex-wrap align-center">
        
        ${images}
    </div>
    `
    return domstring
}

async function toggle_edit_state() {
    profile_edit_state = !profile_edit_state;
    if (profile_edit_state) {
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
        let profile_avatar_container = delete_dom_children("#profile-avatar-container");
        profile_avatar_container.insertAdjacentHTML("beforeend", get_edit_avatar_domstring());
        $("#personal-description-container").insertAdjacentHTML("beforeend", description_domstring);
        $("#profile-description-text").value = profile_info.personal_description;
    }
    else {
        let code = await submit_profile_edit();
        if (code === 1) {
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
        let description_domstring = DOMPurify.sanitize(`
        <div id="profile-description-text" class="profile-description-box">
            ${profile_info.personal_description}
        </div>
        `)
        $("#personal-description-container").insertAdjacentHTML("beforeend", description_domstring);
    }
}


async function ban() {
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

async function fetch_and_render_next_blog_tiles(blog_ids) {
    if (currently_showing >= blog_ids.length) {
        $("#blogs-shown").innerHTML = `${currently_showing}/${blog_ids.length}`;
        return null;
    }
    let temp = await get_certain_blog_tiles_data(blog_ids.slice(currently_showing, currently_showing + blogs_increment));
    if (temp.code != 1) {
        return null
    }
    let blog_tiles = temp.data;
    console.log(blog_tiles)
    if (preferences != undefined) {
        
        let temp = []
        blog_tiles.forEach((blog_tile) => {
            let fits_all = fits_preferences(blog_tile)
            if(fits_all){
                temp.push(blog_tile)
            }
            else{
                currently_hidden += 1;
            }
        })
        blog_tiles = temp;
        
    }
    let authored_blogs_container = $("#authored-blogs-container");
    blog_tiles.forEach((blog_tile_data, index) => {
        insert_blog_tile(blog_tile_data, "#authored-blogs-container")
    })
    currently_showing = Math.min(currently_showing + blogs_increment, blog_ids.length);
    $("#blogs-shown").innerHTML = `${currently_showing}${currently_hidden != 0 ? " (" + currently_hidden + " hidden)" : ""}/${blog_ids.length}`;
    // If all of the authored blogs are shown, then we should remove the "show more" blogs button.
    temp = $("#authored-blogs-show-more-btn")
    if (temp != null && currently_showing == blog_ids.length) {
        temp.remove();
    }
}

function initialize_show_more_blogs_btn(blog_ids) {
    if (currently_showing < blog_ids.length) {
        let show_more_domstring = `
        <button class="btn btn-outline-primary flex-horizontal align-center" id="authored-blogs-show-more-btn">
            <span class="material-icons">
                arrow_circle_down
            </span>

            Show more
        </button>
        `;
        $("#authored-blogs-container").insertAdjacentHTML("beforeend", show_more_domstring);

        $("#authored-blogs-show-more-btn").onclick = () => { fetch_and_render_next_blog_tiles(blog_ids); }
    }
}

async function insert_profile_info() {
    
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
        let preferences_button_domstring = `
        <button id="preferences-btn" class="btn btn-outline-primary profile-control-button flex-horizontal align-center">
            <span class="material-icons">
            online_prediction
            </span>
            Preferences
        </button>
        `
        profile_control_container.insertAdjacentHTML("beforeend", preferences_button_domstring);
        $('#preferences-btn').onclick = toggle_preferences_modal
    }
    else {
        if(auth_info.access_level === 1 && auth_info.username != null){
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
        } else if (auth_info.access_level === 2) {
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
    $("#username-text").textContent = `Username: ${profile_info.username}`
    $("#date-created").textContent = `Date created: ${profile_info.date_created}`
    $("#date-last-accessed").textContent = `Date last accessed: ${profile_info.date_last_accessed}`
    $("#avatar-img").setAttribute("src", `/images/avatar_${profile_info.avatar_image_id}.webp`);
    $("#profile-description-text").textContent = profile_info.personal_description;
    fetch_and_render_next_blog_tiles(profile_info.authored_blogs);
    initialize_show_more_blogs_btn(profile_info.authored_blogs)

}


async function profile_main(username) {
    let profile_temp = await get_public_profile_info(username);
    profile_info = profile_temp.data;
    console.log(profile_info);
    currently_showing = 0;
    
    // This happens when the requested account exists
    if (profile_temp.code === 1) {
        profile_info.username = username;
        profile_info.date_created = convert_iso_date(new Date(profile_info.date_created))
        profile_info.date_last_accessed = convert_iso_date(new Date(profile_info.date_last_accessed))
        insert_profile_info(profile_info);
    }
    // This happens when the requested account does not exist
    else {
        let main = delete_dom_children("main");
        main.insertAdjacentHTML("beforeend", `<h2 style="text-align: center;">No account with username: ${username}, exists.</h2>`);
    }
    currently_selected_avatar = profile_info.avatar_image_id;

}