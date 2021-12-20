let auth_info = {};
let page_state = "home"
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

function login(identifier, password) {
    fetch("/auth/login", {
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

function main() {
    let login_domstring = `
    <div class="nav-item-container nav-button flex-horizontal" role="navigation" tabindex="0">

      <span class="material-icons">
        login
      </span>
      <span class="nav-heading">
        Login/Register
      </span>
    </div>
    `;
    let profile_domstring = `
    <div class="nav-item-container nav-button flex-horizontal" role="navigation" tabindex="0">

    <span class="material-icons">
        account_circle
    </span>
    <span class="nav-heading">
        Profile
    </span>
      
    </div>
    `;
    let nav_element = $("nav");
    if (auth_info.username != null) {
        nav_element.insertAdjacentHTML("beforeend", profile_domstring);
    } else {
        nav_element.insertAdjacentHTML("beforeend", login_domstring);
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
});
// register("egorcik", "egorch.formal@gmail.com", "123qwe", "02/12/2001")
// register("julia", "jul.f@manchester.ac.uk", "polo157gfd$", "03/10/2003")
// login("egorcik", "123qwe")
// login("jul.f@manchester.ac.uk", "polo157gfd$")
