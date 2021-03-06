let login_page_state = "register";
let spinner_domstring = `
<div class="lds-roller" style="margin:1rem;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
`

// Logs the client in. Sends params to server route "/auth/login" via fetch and returns response code
async function login(identifier, password, hcaptcha_response) {
    return fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            identifier: identifier,
            password: password,
            client_identifier: localStorage.getItem("client_identifier"),
            hcaptcha_response: hcaptcha_response
        }),
    })
        .then((result) => result.json())
        .then((result) => {
            return result.code
        });
}

async function initiate_password_recovery(email) {
    return fetch("/auth/initiate_password_recovery", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email
        }),
    }).then((result) => result.json())
        .then((result) => {
            return result
        });
}

async function change_password(password, recovery_token, user_id) {
    return fetch("/auth/change_password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            password: password,
            user_id: user_id,
            recovery_token: recovery_token
        }),
    }).then((result) => result.json())
        .then((result) => {
            return result
        });
}

async function check_recovery_link_status(user_id, recovery_token) {
    return fetch(`/auth/check_recovery_link_status/${user_id}/${recovery_token}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },

    }).then((result) => result.json())
        .then((result) => {
            return result
        });
}

//initiate_password_recovery("egorch.formal@gmail.com")
//change_password("123$Qweasdzxc", "B8cijqoUbewrkCZh1fQZ3zePNnZTCOBPq482yAyv9-RyatYZLzqxYuxaAw98OPX6", 1)
// check_recovery_link_status(1, "B8cijqoUbewrkCZh1fQZ3zePNnZTCOBPq482yAyv9-RyatYZLzqxYuxaAw98OPX6")
// Registers the client. Sends params to server route "/auth/register" via fetch and returns response code
async function register(username, email, password, hcaptcha_response) {
    return fetch("/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
            hcaptcha_response: hcaptcha_response
        }),
    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });
}

// Deletes valid/invalid classes from the element and assigns new class from params
const validate_element = (identifier, cls) => {
    let element = $(identifier);
    element.classList.remove("is-valid");
    element.classList.remove("is-invalid");
    element.classList.add(cls);
}

// Switches the state of the login form. From login to register and vice versa
function change_login_page_state(new_state) {
    login_page_state = new_state;
    let auth_grid = delete_dom_children(".auth-grid");
    switch (login_page_state) {
        case "register": {
            let reg_domstring = `
        <div id="alert-box" class="flex-vertical align-center">
                        
        </div>
        <form class='login-form flex-vertical align-center animate__animated animate__fadeIn needs-validation' novalidate>
            <div >
                <label for='email' class='form-label'>Email</label>
                <input type='email' class="form-control" id='email' required>
                <div class="invalid-feedback" id="email-invalid-feedback">
                    Placeholder text
                </div>
                
            </div>
            <div >
                <label for='username' class='form-label'>Username</label>
                <input type='text' class="form-control" id='username' required>
                <div class="invalid-feedback" id="username-invalid-feedback">
                    Placeholder text
                </div>
            </div>
            <div >
                
                <label for='password' class='form-label'>Password</label>
                    
                
                <input type='password' class="form-control" id='password' required>
                <div class="invalid-feedback">
                    Password must be at least 8 characters long, contain at least one capital letter, special character and a number
                </div>
            </div>
            <div >
                
                <label for='confirm-password' class='form-label'>Confirm Password</label>
                    
                
                <input type='password' class="form-control" id='confirm-password' required>
                <div class="invalid-feedback">
                    Passwords must match
                </div>
            </div>
            
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="terms-agreement" required>
                <label class="form-check-label" for="terms-agreement">
                I agree to the <a class="hoverable-text" href="/termsandcons"> Terms of Service </a>
                </label>
                <div class="invalid-feedback">
                You must agree to the terms and conditions.
                </div>
            </div>
            <button type="submit" class="btn btn-outline-primary form-btn" id="register-btn">Register</button>
            <div class="flex-horizontal align-center bottom-switch-sentence">
                <span>Already registered?</span>
                <button type="button" id='login-switch' class="hoverable-text" role="navigation" tabindex="0">Login</button>
            </div>
        </form>
        `;
            auth_grid.insertAdjacentHTML("beforeend", reg_domstring);
            $('#login-switch').onclick = () => {change_login_page_state("login")}
            $(".login-form").onsubmit = (ev) => 
            {
                ev.preventDefault();
                on_register_click();
            };
            
            
            break;
        }
        case "login": {
            let log_domstring = `
        <div id="alert-box" class="flex-vertical align-center">
                        
        </div>
        <form class='login-form flex-vertical align-center animate__animated animate__fadeIn needs-validation' novalidate>
            <div >
                <label for='identifier' class='form-label'>Email or username</label>
                <input type='text' class="form-control" id='identifier' >
                <div class="invalid-feedback" id="identifier-invalid-feedback">
                    placeholder
                </div>
            </div>
            <div >
                <div >
                    <label for='password' class='form-label'>Password</label>
                    <button type="button" id='forgot-password' class="hoverable-text" role="navigation" tabindex="0">Forgot password?</button>
                    
                </div>
                
                <input type='password' class="form-control" id='password'>
                <div class="invalid-feedback" id="login-password-invalid-feedback">
                    placeholder
                </div>
                
            </div>
            <button type="submit" class="btn btn-outline-primary form-btn" id="login-btn" >Log in</button>
            <div class="flex-horizontal align-center bottom-switch-sentence">
                <span>Not registered yet? </span>
                <button type="button" id='register-switch' class="hoverable-text" role="navigation" tabindex="0">Register</button>
            </div>
        </form>
        `
            auth_grid.insertAdjacentHTML("beforeend", log_domstring);
            $(".login-form").onsubmit = (ev) => 
            {
                ev.preventDefault();
                on_login_click();
            };
            $('#register-switch').onclick = () => {change_login_page_state("register")}
            $("#forgot-password").onclick = () => {change_login_page_state("forgot_password")};
            // Enable submittion via enter
            
            break;
        }
        case "forgot_password": {
            let forgot_password_domstring = `
            <div id="alert-box" class="flex-vertical align-center">
                        
            </div>
            <form class='login-form flex-vertical align-center animate__animated animate__fadeIn needs-validation' novalidate>
                <div >
                    <label for='email' class='form-label'>Email</label>
                    <input type='email' class="form-control" id='email' required>
                    <div class="invalid-feedback" id="email-invalid-feedback">
                        Placeholder text
                    </div>
                    
                </div>
                
                <button type="submit" class="btn btn-outline-primary form-btn" id="recover-btn">Recover</button>
                <div class="flex-horizontal align-center bottom-switch-sentence">
                    <span>Remembered the password?</span>
                    <button type="button" id='login-switch' class="hoverable-text" role="navigation" tabindex="0">Login</button>
                </div>
            </form>
            `
            auth_grid.insertAdjacentHTML("beforeend", forgot_password_domstring);
            $('#login-switch').onclick = () => {change_login_page_state("login")}
            $(".login-form").onsubmit = (ev) => 
            {
                ev.preventDefault();
                on_recover_password_click();
            };
            
            break;
        }
        
    }
    

}

let reset_validation_classes = (identifiers) => {
    identifiers.forEach((identifier) => {
        $(identifier).classList.remove('is-valid', "is-invalid")
    })
}

// Event handler for login button click
async function on_login_click() {
    reset_validation_classes(["#identifier", "#password"])
    let identifier = $("#identifier").value;
    let password = $("#password").value;
    // Check that identifier and password fields are not empty
    let identifier_class = identifier != "" ? "is-valid" : "is-invalid";
    let password_class = password != "" ? "is-valid" : "is-invalid";
    if (identifier_class === "is-invalid") {
        $("#identifier-invalid-feedback").innerHTML = "Please fill in your email/name";
        validate_element("#identifier", identifier_class);
    }
    if (password_class === "is-invalid") {
        $("#login-password-invalid-feedback").innerHTML = "Please fill in your password";
        validate_element("#password", password_class);
    }

    
    
    // If any field is empty, don't call login route
    if (identifier_class === "is-invalid" || password_class === "is-invalid") {
        return null
    }
    $("#alert-box").insertAdjacentHTML('beforeend', spinner_domstring);
    let hcaptcha_widget = hcaptcha.render($("body"), {
        size: "invisible",
        sitekey: "28dd5d54-e402-445c-ac00-541d3e9cadc3"
    })
    let hcaptcha_result = await hcaptcha.execute(hcaptcha_widget, {
        async: true
    })
    let code = await login(identifier, password, hcaptcha_result.response);
    delete_dom_children("#alert-box");
    // if code is 2, then non-existant account with identifier
    if (code === 2) {
        $("#identifier-invalid-feedback").innerHTML = "No account with this email/username exists. You can register by clicking the Register at the bottom";
        validate_element("#identifier", "is-invalid");
    }
    // If code is 3, then passwords don't match
    else if (code === 3) {
        $("#login-password-invalid-feedback").innerHTML = "Invalid credentials. If you forgot your password restore it by clicking forgot password";
        validate_element("#password", "is-invalid");
    }
    else if (code === 1) {
        change_page_state(`/home`)
        location.reload();
    }
}

const validate_email = (str) => {

    let email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    return email_regex.test(str)
}

// Password has to be at least 8 characters, at least one special character, at least one capital letter
const validate_passwords = (password, repeatPassword) => {

    let password_regex = /(?=.*[A-Z]{1,}.*)(?=.*\W{1,}.*)(?=.*\d{1,}.*)(?=.{8,})/
    let password_valid = password_regex.test(password);
    let passwords_match = password === repeatPassword;
    return {
        password_valid: password_valid,
        passwords_match: passwords_match
    };
}

async function check_username_email(email, username) {
    return fetch("/auth/check_username_email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            email: email,
        }),
    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });
}

// Event handler for register button click
async function on_register_click() {
    reset_validation_classes(["#email", "#password", "#username", "#confirm-password", "#terms-agreement"])
    let email = $("#email").value;
    let username = $("#username").value;
    let password = $("#password").value;
    let confirmPassword = $("#confirm-password").value;
    
    let terms_agreement_checked = $("#terms-agreement").checked;
    // Function to remove previous validation classes and assign the new class

    // Validates the email via standard email regex
    

    // username can only contain letters, numbers and underscores. Must be fewer than or equal to 30 characters
    const validate_username = (str) => {

        let username_valid = /^\w{1,30}$/.test(username);
        return username_valid
    }


    // // We will simply check that there is a date of birth and its not in the future
    // const validate_dob = (dob) => {

    //     if (dob.length === 0) {
    //         return false;
    //     }
    //     const today = new Date();
    //     const user_dob = new Date(dob);
    //     return today > user_dob;
    // }

    let email_valid = validate_email(email);
    let email_class = email_valid ? "is-valid" : "is-invalid";
    // This is needed because email field can be invalid for two reasons. This is for invalid email
    if (email_valid === false) {
        $("#email-invalid-feedback").innerHTML = "Please enter a valid email address";
        validate_element("#email", email_class);
    }
    
    let username_valid = validate_username(username);
    let username_class = username_valid ? "is-valid" : "is-invalid";
    // This is needed because there are two ways username field could be invalid: invalid username or username taken
    if (username_valid === false) {
        $("#username-invalid-feedback").innerHTML = "Please enter a username of length 1-30, using only: letters, numbers and underscores";
        validate_element("#username", username_class);
    }
    
    // Validate password
    let temp = validate_passwords(password, confirmPassword);
    let password_class = temp.password_valid ? "is-valid" : "is-invalid";
    let confirmPassword_class = temp.passwords_match ? "is-valid" : "is-invalid";
    validate_element("#password", password_class);
    validate_element("#confirm-password", confirmPassword_class);
    // // Validate date of birth
    // let dob_valid = validate_dob(dob);
    // let dob_class = dob_valid ? "is-valid" : "is-invalid";
    // validate_element("#date-of-birth", dob_class);
    let agreements_class = terms_agreement_checked ? "is-valid" : "is-invalid";
    validate_element("#terms-agreement", agreements_class);
    // Guarding clause, to prevent execution of next code if any of inputs are invalid
    if (email_valid === false || username_valid === false || temp.password_valid === false
        || temp.passwords_match === false || terms_agreement_checked === false) {
        return null;
    }
    
    $("#alert-box").insertAdjacentHTML('beforeend', spinner_domstring);
    let tmp = await check_username_email(email, username)
    
    if(tmp.code != 1){
        return null
    }
    let uniqueness_info = tmp.data;
    // This means the chosen email is taken
    if (uniqueness_info.email_exists){
        $("#email-invalid-feedback").innerHTML = "Please choose a different email address, as an account with this email address already exists";
        validate_element("#email", "is-invalid");
        delete_dom_children("#alert-box");
    }
    else{
        validate_element("#email", "is-valid");
    }
    // This means that the chosen username is already taken
    if (uniqueness_info.username_exists){
        $("#username-invalid-feedback").innerHTML = "Please choose a different username, as this username is already taken";
        validate_element("#username", "is-invalid");
        delete_dom_children("#alert-box");
    }
    else{
        validate_element("#username", "is-valid");
    }
    
    if(uniqueness_info.username_exists || uniqueness_info.email_exists){
        delete_dom_children("#alert-box");
        
        return null
    }
    // This will only get executed if username and email are unique
    // Execute invisible hcaptcha
    let hcaptcha_widget = hcaptcha.render($("body"), {
        size: "invisible",
        sitekey: "28dd5d54-e402-445c-ac00-541d3e9cadc3"
    })
    let hcaptcha_result = await hcaptcha.execute(hcaptcha_widget, {
        async: true
    })
    
    let reg_result = await register(username, email, password, hcaptcha_result.response);
    delete_dom_children("#alert-box");
    // This means successfully registered
    if (reg_result.code === 1) {
        compose_alert(`Account with username: <strong>${username}</strong> has been successfully registered!`, true)
        
    }
}

const remove_alert = () => {
    let temp = $(".fixed-alert")
    if (temp != null){
        temp.remove();
    }
}

let compose_alert = (alert_text, isSuccess) => {
    remove_alert();
    let alert =  `
    <div class="flex-horizontal align-center fixed-alert" role="alert">
        <span class="material-icons">
            ${isSuccess ? "check_circle" : "error"}
        </span>
        <span style="margin-left: 0.8rem">${alert_text}</span>
        <button class="flex-horizontal align-center close-btn" style="margin-left: 0.8rem; color:inherit !important;">
            <span class="material-icons close"  style="color:inherit !important; font-size:inherit !important;">
                close
            </span>
        <button>
    </div>
    `
    $("#main").insertAdjacentHTML("beforeend", alert);
    $(".close-btn").onclick = remove_alert;
}

async function on_recover_password_click(){
    reset_validation_classes(["#email"])
    let email = $("#email").value;
    let email_class = (validate_email(email) && email != "") ? "is-valid" : "is-invalid";
    
    if (email_class === "is-invalid"){
        validate_element("#email", email_class);
        $("#email-invalid-feedback").innerHTML = "Please enter a valid email address";
        return null;
    }
    $("#alert-box").insertAdjacentHTML("beforeend", spinner_domstring);
    let recovery_info = await initiate_password_recovery(email)
    console.log(recovery_info);
    delete_dom_children("#alert-box");
    switch (recovery_info.code) {
        case 1:{
            compose_alert(`An email with recovery link has been successfully sent to <strong>${email}</strong>. Please check spam folder, the email should come from <strong>otf.mailer@gmail.com</strong>`, true);
            break;
        }
        case 3:{
            validate_element("#email", "is-invalid");
            $("#email-invalid-feedback").innerHTML = "No account with that email address is found. Please check that the entered email address is correct";
            break;
        }
        default:{
            compose_alert(`Unnexpected error happened. Please try again`, false);
            break;
        }

    }
}

async function on_submit_password_change_btn_click(user_id, recovery_token){
    reset_validation_classes(["#password", "#confirm-password"])
    let password = $("#password").value;
    let confirmPassword = $("#confirm-password").value;
    let temp = validate_passwords(password, confirmPassword);
    let password_class = temp.password_valid ? "is-valid" : "is-invalid";
    let confirmPassword_class = temp.passwords_match ? "is-valid" : "is-invalid";
    validate_element("#password", password_class);
    validate_element("#confirm-password", confirmPassword_class);
    if (temp.password_valid === false || temp.passwords_match === false) {
        return null;
    }
    $("#alert-box").insertAdjacentHTML('beforeend', spinner_domstring);
    let change_password_status_info = await change_password(password, recovery_token, user_id);
    delete_dom_children("#alert-box");
    switch(change_password_status_info.code){
        case 1: {
            compose_alert("Password has been successfully changed.", true)
            break;
        }
        default: {
            compose_alert("Unnexpected error occured. Please try again.", false);
            break;
        }
    }
}

async function render_recover_password(user_id, recovery_token){
    $("#alert-box").insertAdjacentHTML('beforeend', spinner_domstring);
    let recovery_link_status = await check_recovery_link_status(user_id, recovery_token);
    delete_dom_children("#alert-box");
    switch(recovery_link_status.code){
        case 3: {
            compose_alert(`Invalid recovery link, make sure to correctly copy the link`, false)
            return null;
        }
        case 4: {
            compose_alert(`Your link is correct, but it has expired. Please recover the password via "Forgot password?" button on the login page again`, false)
            return null;
        }
    }
    console.log(recovery_link_status);
    let recover_domstring = `
    <form class='login-form flex-vertical align-center animate__animated animate__fadeIn needs-validation' novalidate>
        <h2>Password reset</h2>
        <div >
            
            <label for='password' class='form-label'>New Password</label>
                
            
            <input type='password' class="form-control" id='password' required>
            <div class="invalid-feedback">
                Password must be at least 8 characters long, contain at least one capital letter and contain at least one number
            </div>
        </div>
        <div >
            
            <label for='confirm-password' class='form-label'>Confirm new Password</label>
                
            
            <input type='password' class="form-control" id='confirm-password' required>
            <div class="invalid-feedback">
                Passwords must match
            </div>
        </div>
        
        <button type="button" class="btn btn-outline-primary form-btn" id="submit-password-change-btn">Reset</button>
        
    </form>
    `
    $(".auth-grid").insertAdjacentHTML("beforeend", recover_domstring);
    $("#submit-password-change-btn").onclick = () => {on_submit_password_change_btn_click(user_id, recovery_token)};

}