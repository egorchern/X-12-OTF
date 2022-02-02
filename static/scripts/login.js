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
            return result.code;
        });
}

function switch_login_page_state(){
    
    let auth_grid = delete_dom_children(".auth-grid");

    if (login_page_state === "login"){
        let reg_domstring = `
        <div id="alert-box" class="flex-vertical align-center">
                        
        </div>
        <form class='login-form flex-vertical align-center animate__animated animate__fadeIn needs-validation' novalidate>
            <div >
                <label for='email' class='form-label'>Email</label>
                <input type='email' class="form-control" id='email' required>
                <div class="invalid-feedback">
                    Please include a valid email address.
                </div>
                
            </div>
            <div >
                <label for='username' class='form-label'>Username</label>
                <input type='text' class="form-control" id='username' required>
                
            </div>
            <div >
                
                <label for='password' class='form-label'>Password</label>
                    
                
                <input type='password' class="form-control" id='password' required>
                
            </div>
            <div >
                
                <label for='confirm-password' class='form-label'>Confirm Password</label>
                    
                
                <input type='password' class="form-control" id='confirm-password' required>
                
            </div>
            <div>
                <label for="date-of-birth">Date Of Birth</label>
                <input type="date" class="form-control" id='date-of-birth' required>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="terms-agreement" required>
                <label class="form-check-label" for="terms-agreement">
                I agree to the <span class="hoverable-text"> Terms of Service </span>
                </label>
                <div class="invalid-feedback">
                You must agree to the terms and conditions.
                </div>
            </div>
            <button type="button" class="btn btn-outline-primary form-btn" id="register-btn">Register</button>
            <div class="flex-horizontal align-center bottom-switch-sentence">
                <span>Already registered?</span>
                <span id='login-switch' class="hoverable-text">Login</span>
            </div>
        </form>
        `;
        auth_grid.insertAdjacentHTML("beforeend", reg_domstring);
        $('#login-switch').onclick = switch_login_page_state
        $('#register-btn').onclick = on_register_click
        login_page_state = "register";
    }
    else{
        let log_domstring = `
        <div id="alert-box" class="flex-vertical align-center">
                        
        </div>
        <form class='login-form flex-vertical align-center animate__animated animate__fadeIn'>
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
            <button type="button" class="btn btn-outline-primary form-btn" id="login-btn" >Log in</button>
            <div class="flex-horizontal align-center bottom-switch-sentence">
                <span>Not registered yet? </span>
                <span id='register-switch' class="hoverable-text" >Register</span>
            </div>
        </form>
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

async function on_register_click(){
    let email = $("#email").value;
    let username = $("#username").value;
    let password = $("#password").value;
    let confirmPassword = $("#confirm-password").value;
    let dob = $("#date-of-birth").value;
    let terms_agreement = $("#terms-agreement").checked
    // Validates the email via standard email regex
    const validate_email = (str) => {
        let email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
        return email_regex.test(str)
    }
    let email_valid = validate_email(email);
    let email_class = email_valid ? "is-valid" : "is-invalid";
    let temp = $('#email');
    // Remove all invalids or valids from possible previous validations and add current validation
    temp.classList.remove("is-valid");
    temp.classList.remove("is-invalid");
    temp.classList.add(email_class);
    
}