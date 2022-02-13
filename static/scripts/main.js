let auth_info = {};
let page_state = "";
// This makes it possible to go back using the back button in hte browser, using history api
window.onpopstate = (ev) => {
    let state = ev.state;
    change_page_state(state.page_state);
}

// Jquery like selection, because I like it
function $(selector) {
    return document.querySelector(selector);
}

// Deletes all children from element
function delete_dom_children(identifier){
    let element = $(identifier);
    while (element.firstChild){
        element.removeChild(element.firstChild)
    }
    return element;
}

// Creates a unique identifier for client
function create_client_identifier() {
    let temp = localStorage.getItem("client_identifier");
    if (temp === null) {
        fetch("/auth/generate_client_identifier", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((result) => result.json())
            .then((result) => {
                localStorage.setItem(
                    "client_identifier",
                    result.client_identifier
                );
            });
    }
}

// Logs the client out of their account. Send request to "auth/logout" server route.
function logout() {
    fetch("/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((result) => result.json())
        .then((result) => {
            location.reload();
        });
}

// Get details of the currently logged user. Send request to "auth/userinfo" server route.
function get_user_info() {
    return fetch("/auth/get_user_info", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((result) => result.json())
        .then((result) => {
            return result;
        });
}

// This changes page state depending on the url. So makes possible to go straight to some page
function initialize_page_state(){
    let path = document.location.pathname;
    if (path === "/"){
        change_page_state("/home");
    }
    else if (path === "/home"){
        change_page_state("/home");
    }
    else if(path === "/login-register"){
        change_page_state("/login");
    }
    else if(/^\/profile\/(?<username>.+)$/.test(path)){
        change_page_state(path);
    }
}

/*
Change page state
Page States:
"/home": Home
"/login": Login
"/about_us": About us
"profile/<username>": Profile of a certain username
*/
async function change_page_state(new_state){
    console.log(page_state, new_state);
    // If trying to switch to the same state, no need to do anything
    if (new_state === page_state){
        return null;
    }
    page_state = new_state;
    // Remove all elements from main
    let main_html = delete_dom_children("main");
    if (new_state === "/login"){
        let login_domstring = `
            <div class='login-page-container flex-vertical align-center'>
                <div class="auth-grid">
                    <div id="alert-box" class="flex-vertical align-center">
                        
                    </div>
                    
                </div>
                
            </div>
        `
        history.pushState({page_state: page_state}, null, "/login-register")
        main_html.insertAdjacentHTML("beforeend", login_domstring);
        switch_login_page_state()
    }
    else if(new_state === "/home"){
        let home_domstring = `
        <div class="home-container">
            <div class="blog-tile">
                <div class="flex-vertical align-center">
                    <img class="author-avatar" src="/images/avatar_1.webp">
                    <div class="flex-vertical align-center">
                        <span>Created by:</span>
                        <strong>Jessica_Hershley</strong>
                    </div>
                </div>
            </div>
        </div>
        `
        history.pushState({page_state: page_state}, null, "/home")
        main_html.insertAdjacentHTML("beforeend", home_domstring);
        
    }
    else if(/^\/profile\/.+$/.test(new_state)){
        let temp = /^\/profile\/(?<username>.+)$/.exec(new_state);
        
        if(temp === null){
            return null;
        }
        let username = temp.groups.username;
        let profile_domstring = `
            <div id="profile-container" class="animate__animated animate__fadeIn">
                <div id="profile-control-container" >
                </div>
                <div class="profile-header-container flex-vertical align-center">
                    <img id="avatar-img">
                    <h4 id="username-text"></h4>
                    
                </div>
                <div id="personal-description-container" class="flex-vertical">
                    <h3 style="text-align: center">Personal Description</h3>
                    <div id="profile-description-text" class="profile-description-box">
                    </div>
                </div>
            </div>
        `;
        history.pushState({page_state: page_state}, null, `/profile/${username}`);
        main_html.insertAdjacentHTML("beforeend", profile_domstring);
        profile_main(username);
    }
    
    

}

// Called after userinfo is loaded. Initializes the page
function main() {
    
    
    // Insert either a profile nav element or login nav element depending on authentication info
    let nav_element = $("nav");
    if (auth_info.username != null) {
        let profile_domstring = `
            <button class="nav-item-container nav-button flex-horizontal" role="navigation" tabindex="0" id="profile">

                <span class="material-icons">
                    account_circle
                </span>
                <span class="nav-heading">
                    Profile
                </span>
            
            </button>
        `;
        nav_element.insertAdjacentHTML("beforeend", profile_domstring);
        $("#profile").onclick = () => {change_page_state(`/profile/${auth_info.username}`)};
        
    } else {
        let login_domstring = `
            <button class="nav-item-container nav-button flex-horizontal" id="login" role="navigation" tabindex="0">

            <span class="material-icons">
                login
            </span>
            <span class="nav-heading">
                Login/Register
            </span>
            </button>
        `;
        nav_element.insertAdjacentHTML("beforeend", login_domstring);
        $("#login").onclick = () => {change_page_state("/login")}

    }
    $("#home-btn").onclick = () => {change_page_state("/home")}
}

create_client_identifier();
let details_promise = get_user_info();

// When all static content is loaded
document.addEventListener("DOMContentLoaded", (event) => {
    // need to have details ready before executing main
    details_promise.then((user_details) => {
        auth_info = user_details
        main();
    });
    initialize_page_state();
});
// register("egorcik", "egorch.formal@gmail.com", "123qwe", "02/12/2001")
// register("julia", "jul.f@manchester.ac.uk", "polasdfsdfdsasfad14F141$$$", "2021-03-21")
// login("egorcik", "123qwe")
// login("jul.f@manchester.ac.uk", "polo157gfd$")
