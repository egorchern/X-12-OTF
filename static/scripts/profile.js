let profile_edit_state = false;
let profile_info = {};
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
    profile_info.data.personal_description = personal_description;
    return fetch(`/api/edit/profile/${profile_info.data.username}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(profile_info.data)
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
                check_circle
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
        $("#profile-description-text").value = profile_info.data.personal_description;
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
            ${profile_info.data.personal_description}
        </div>
        `
        $("#personal-description-container").insertAdjacentHTML("beforeend", description_domstring);
    }
}

function insert_profile_info(profile_info){
    let profile_control_container = $("#profile-control-container");
    // This means that the user is on their own profile, so should add edit button
    if (auth_info.username === profile_info.data.username) {
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
        let report_button_domstring = `
        <button class="btn btn-outline-danger profile-control-button flex-horizontal align-center">
            <span class="material-icons">
                gavel
            </span>
            Report
        </button>
        `;
        profile_control_container.insertAdjacentHTML("beforeend", report_button_domstring);
    }
    $("#username-text").innerHTML = `Username: ${profile_info.data.username}`
    $("#avatar-img").setAttribute("src", `/images/avatar_${profile_info.data.avatar_image_id}.webp`);
    $("#profile-description-text").innerHTML = profile_info.data.personal_description;
}

async function profile_main(username){
    profile_info = await get_public_profile_info(username);
    // This happens when the requested account exists
    if (profile_info.code === 1){
        profile_info.data.username = username;
        insert_profile_info(profile_info);
    }
    // This happens when the requested account does not exist
    else{
        let main = delete_dom_children("main");
        main.insertAdjacentHTML("beforeend", `<h2 style="text-align: center;">No account with username: ${username}, exists.</h2>`);
    }
    
}