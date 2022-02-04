let auth_info = {};
let page_state = ""
function $(selector) {
    return document.querySelector(selector);
}

function delete_dom_children(identifier){
    let element = $(identifier);
    while (element.firstChild){
        element.removeChild(element.firstChild)
    }
    return element;
}

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

function get_user_info() {
    return fetch("/auth/get_user_info", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((result) => result.json())
        .then((result) => {
            auth_info = result;
        });
}


/*
Page States:
"home": Home
"login": Login
"about_us": About us
*/
async function change_page_state(new_state){
    if (new_state === page_state){
        return null;
    }
    page_state = new_state;
    // Remove all elements from main
    let main_html = delete_dom_children("main");
    if (new_state === "login"){
        let login_domstring = `
            <div class='login-page-container flex-vertical align-center'>
                <div class="auth-grid">
                    <div id="alert-box" class="flex-vertical align-center">
                        
                    </div>
                    
                </div>
                
            </div>
        `
        
        main_html.insertAdjacentHTML("beforeend", login_domstring);
        switch_login_page_state()
    }
    else if(new_state === "home"){
        let home_domstring = `
        <div class="poster-container">
            <img src="/images/poster.png" alt="OpenThoughtFloor poster">
        </div>
        `
        main_html.insertAdjacentHTML("beforeend", home_domstring);
        
    }
    
    

}

function main() {
    let login_domstring = `
    <div class="nav-item-container nav-button flex-horizontal" id="login" role="navigation" tabindex="0">

      <span class="material-icons">
        login
      </span>
      <span class="nav-heading">
        Login/Register
      </span>
    </div>
    `;
    let profile_domstring = `
    <div class="nav-item-container nav-button flex-horizontal" role="navigation" tabindex="0" id="profile">

    <span class="material-icons">
        account_circle
    </span>
    <span class="nav-heading">
        Profile
    </span>
      
    </div>
    `;
    // Insert either a profile nav element or login nav element depending on authentication info
    let nav_element = $("nav");
    if (auth_info.username != null) {
        nav_element.insertAdjacentHTML("beforeend", profile_domstring);
        
    } else {
        nav_element.insertAdjacentHTML("beforeend", login_domstring);
        $("#login").onclick = () => {change_page_state("login")}

    }
    $("#home-btn").onclick = () => {change_page_state("home")}
}

create_client_identifier();
let details_promise = get_user_info();

// When all static content is loaded
document.addEventListener("DOMContentLoaded", (event) => {
    // need to have details ready before executing main
    details_promise.then((details) => {
        main();
    });
    change_page_state("login");
});
// register("egorcik", "egorch.formal@gmail.com", "123qwe", "02/12/2001")
// register("julia", "jul.f@manchester.ac.uk", "polasdfsdfdsasfad14F141$$$", "2021-03-21")
// login("egorcik", "123qwe")
// login("jul.f@manchester.ac.uk", "polo157gfd$")
