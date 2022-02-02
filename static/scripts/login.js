let login_page_state = "register";

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

function switch_login_page_state(){
    console.log(login_page_state);
    let auth_grid = delete_dom_children(".auth-grid");

    if (login_page_state === "login"){
        let reg_domstring = `
        <div id="alert-box" class="flex-vertical align-center">
                        
        </div>
        <div class='login-form flex-vertical align-center animate__animated animate__fadeIn'>
            <div >
                <label for='email' class='form-label'>Email</label>
                <input type='email' class="form-control" id='email'>
                
            </div>
            <div >
                <label for='username' class='form-label'>Username</label>
                <input type='text' class="form-control" id='username'>
                
            </div>
            <div >
                
                <label for='password' class='form-label'>Password</label>
                    
                
                <input type='password' class="form-control" id='password'>
                
            </div>
            <button class="btn btn-outline-primary" id="login-btn">Register</button>
            <div class="flex-horizontal align-center">
                <span>Already registered?</span>
                <span id='login-switch' class="hoverable-text">Login</span>
            </div>
        </div>
        `;
        auth_grid.insertAdjacentHTML("beforeend", reg_domstring);
        $('#login-switch').onclick = switch_login_page_state
        login_page_state = "register";
    }
    else{
        let log_domstring = `
        <div id="alert-box" class="flex-vertical align-center">
                        
        </div>
        <div class='login-form flex-vertical align-center animate__animated animate__fadeIn'>
            <div >
                <label for='identifier' class='form-label'>Email or username</label>
                <input type='text' class="form-control" id='identifier' >
                
            </div>
            <div >
                <div >
                    <label for='password' class='form-label'>Password</label>
                    <span id='forgot-password' class="hoverable-text">Forgot password?</span>
                </div>
                
                <input type='password' class="form-control" id='password'>
                
            </div>
            <button class="btn btn-outline-primary" id="login-btn">Log in</button>
            <div class="flex-horizontal align-center">
                <span>Not registered yet? </span>
                <span id='register-switch' class="hoverable-text" >Register</span>
            </div>
        </div>
        `
        auth_grid.insertAdjacentHTML("beforeend", log_domstring);
        $('#login-btn').onclick = on_login_click;
        $('#register-switch').onclick = switch_login_page_state
        login_page_state = "login";

    }

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