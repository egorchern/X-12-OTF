let auth_info = {};
let page_state = "login"
function $(selector) {
    return document.querySelector(selector);
}

function register(username, email, password, date_of_birth) {
    fetch("/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
            date_of_birth: date_of_birth,
        }),
    })
        .then((result) => result.json())
        .then((result) => {
            console.log(result);
        });
}

async function login(identifier, password) {
    return fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            identifier: identifier,
            password: password,
            client_identifier: localStorage.getItem("client_identifier"),
        }),
    })
        .then((result) => result.json())
        .then((result) => {
            if (result.code == 1) {
                location.reload();
            }
            else{
                return result.code
            }
        });
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

async function fetchStyle(url){
    return new Promise((resolve, reject) => {
        let link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.onload = function() { resolve(); console.log('style has loaded'); };
        link.href = url;
    
        let headScript = document.querySelector('script');
        headScript.parentNode.insertBefore(link, headScript);
    });
}

async function on_login_click(){
    let identifier = $("#identifier").value;
    let password = $("#password").value;
    
    let code = await login(identifier, password);
    console.log(code)
}
/*
Page States:
"home": Home
"login": Login
"about_us": About us
*/
async function change_page_state(newState){
    page_state = newState;
    // Remove all elements from main
    let main_html = $("main")
    while (main_html.firstChild){
        main_html.removeChild(main_html.firstChild)
    }
    if (page_state === "login"){
        let login_domstring = `
            <div class='login-page-container flex-vertical align-center'>
                <div class='login-form flex-vertical align-center appear-animated'>
                    <div >
                        <label for='identifier' class='form-label'>Email or username</label>
                        <input type='text' class="form-control" id='identifier' placeholder="identifier">
                        
                    </div>
                    <div >
                        <div >
                            <label for='password' class='form-label'>Password</label>
                            <span class='forgot-password'>Forgot password?</span>
                        </div>
                        
                        <input type='password' class="form-control" id='password' placeholder="password">
                        
                    </div>
                    <button class="btn btn-outline-primary" id="login-btn">Log in</button>
                    <div class="flex-horizontal align-center">
                        <span>Not registered yet?</span>
                        <span class='register'>Register</span>
                    </div>
                </div>
            </div>
        `
        main_html.insertAdjacentHTML("beforeend", login_domstring);
        $("#login-btn").onclick = on_login_click
    }
    else if(page_state === "home"){
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
// register("julia", "jul.f@manchester.ac.uk", "polo157gfd$", "03/10/2003")
// login("egorcik", "123qwe")
// login("jul.f@manchester.ac.uk", "polo157gfd$")
