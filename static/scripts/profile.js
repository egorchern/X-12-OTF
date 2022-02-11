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
        <button class="btn btn-outline-primary profile-control-button flex-horizontal align-center">
            <span class="material-icons">
                edit
            </span>
            Edit
        </button>
        `;
        profile_control_container.insertAdjacentHTML("beforeend", edit_button_domstring);
    }
    $("#username-text").innerHTML = `Username: ${profile_info.data.username}`
    $("#avatar-img").setAttribute("src", `/images/avatar_${profile_info.data.avatar_image_id}.webp`);
    $("#profile-description-text").innerHTML = profile_info.data.personal_description;
}

async function profile_main(username){
    let profile_info = await get_public_profile_info(username);
    console.log(profile_info);
    profile_info.data.username = username;
    insert_profile_info(profile_info);
    
}