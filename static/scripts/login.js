

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
            return result.code
        });
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

async function on_login_click(){
    let identifier = $("#identifier").value;
    let password = $("#password").value;
    
    let code = await login(identifier, password);
    let refresh_interval = 2000;
    let alert_box = delete_dom_children("#alert-box");
    let alert = `
    <div class="alert alert-${code === 1 ? "success" : "danger"} alert-dismissible fade show flex-horizontal align-center" role="alert">
        <span class="material-icons">
            error
        </span>
        <span style="margin-left: 0.8rem">${code === 1 ? ("Successfull login, refreshing page in: " + String(refresh_interval / 1000) + " seconds") : "Invalid Credentials" }</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `
    alert_box.insertAdjacentHTML("beforeend", alert);
    if (code === 1){
        setTimeout(() => {location.reload();}, refresh_interval);
    }
}