let login_page_state = "register";

// Logs the client in. Sends params to server route "/auth/login" via fetch and returns response code
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

// Registers the client. Sends params to server route "/auth/register" via fetch and returns response code
async function register(username, email, password, date_of_birth) {
    return fetch("/auth/register", {
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

// Deletes valid/invalid classes from the element and assigns new class from params
const validate_element = (identifier, cls) => {
    let element = $(identifier);
    element.classList.remove("is-valid");
    element.classList.remove("is-invalid");
    element.classList.add(cls);
}

// Switches the state of the login form. From login to register and vice versa
function switch_login_page_state() {

    let auth_grid = delete_dom_children(".auth-grid");

    if (login_page_state === "login") {
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
                    Password must be at least 8 characters long, contain at least one capital letter and contain at least one number
                </div>
            </div>
            <div >
                
                <label for='confirm-password' class='form-label'>Confirm Password</label>
                    
                
                <input type='password' class="form-control" id='confirm-password' required>
                <div class="invalid-feedback">
                    Passwords must match
                </div>
            </div>
            <div>
                <label for="date-of-birth">Date Of Birth</label>
                <input type="date" class="form-control" id='date-of-birth' required>
                <div class="invalid-feedback">
                Please input a valid date of birth date
                </div>
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
                <button id='login-switch' class="hoverable-text" role="navigation" tabindex="0">Login</button>
            </div>
        </form>
        `;
        auth_grid.insertAdjacentHTML("beforeend", reg_domstring);
        $('#login-switch').onclick = switch_login_page_state
        $('#register-btn').onclick = on_register_click
        login_page_state = "register";
    }
    else {
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
                    <button id='forgot-password' class="hoverable-text" role="navigation" tabindex="0">Forgot password?</button>
                    
                </div>
                
                <input type='password' class="form-control" id='password'>
                <div class="invalid-feedback" id="login-password-invalid-feedback">
                    placeholder
                </div>
                
            </div>
            <button type="button" class="btn btn-outline-primary form-btn" id="login-btn" >Log in</button>
            <div class="flex-horizontal align-center bottom-switch-sentence">
                <span>Not registered yet? </span>
                <button id='register-switch' class="hoverable-text" role="navigation" tabindex="0">Register</button>
            </div>
        </form>
        `
        auth_grid.insertAdjacentHTML("beforeend", log_domstring);
        $('#login-btn').onclick = on_login_click;
        $('#register-switch').onclick = switch_login_page_state
        login_page_state = "login";

    }

}

// Event handler for login button click
async function on_login_click() {
    let identifier = $("#identifier").value;
    let password = $("#password").value;
    // Check that identifier and password fields are not empty
    let identifier_class = identifier != "" ? "is-valid" : "is-invalid";
    let password_class = password != "" ? "is-valid" : "is-invalid";
    if (identifier_class === "is-invalid"){
        $("#identifier-invalid-feedback").innerHTML = "Please fill in your email/name";
    }
    if (password_class === "is-invalid"){
        console.log(password_class);
        $("#login-password-invalid-feedback").innerHTML = "Please fill in your password";
    }
    
    validate_element("#identifier", identifier_class);
    validate_element("#password", password_class);
    // If any field is empty, don't call login route
    if (identifier_class === "is-invalid" || password_class === "is-invalid") {
        return null
    }
    let code = await login(identifier, password);
    // if code is 2, then non-existant account with identifier
    if (code === 2){
        $("#identifier-invalid-feedback").innerHTML = "No account with this email/username exists. You can register by clicking the Register at the bottom";
        validate_element("#identifier", "is-invalid");
    }
    // If code is 3, then passwords don't match
    else if (code === 3){
        $("#login-password-invalid-feedback").innerHTML = "Invalid credentials. If you forgot your password restore it by clicking forgot password";
        validate_element("#password", "is-invalid");
    }
    else if (code === 1){
        location.reload();
    }
}

// Event handler for register button click
async function on_register_click() {
    let email = $("#email").value;
    let username = $("#username").value;
    let password = $("#password").value;
    let confirmPassword = $("#confirm-password").value;
    let dob = $("#date-of-birth").value;
    let terms_agreement_checked = $("#terms-agreement").checked;
    // Function to remove previous validation classes and assign the new class
    
    // Validates the email via standard email regex
    const validate_email = (str) => {
        
        let email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
        return email_regex.test(str)
    }

    // username can only contain letters, numbers and underscores. Must be fewer than or equal to 30 characters
    const validate_username = (str) => {
        
        let username_valid = /^\w{1,30}$/.test(username);
        return username_valid
    }

    // Password has to be at least 8 characters, at least one special character, at least one capital letter
    const validate_passwords = (password, repeatPassword) => {
        
        let password_regex = /(?=\w*\W{1,}\w*)(?=\D*\d{1,}\D*)(?=.{8,})/
        let password_valid = password_regex.test(password);
        let passwords_match = password === repeatPassword;
        return {
            password_valid: password_valid,
            passwords_match: passwords_match
        };
    }

    // We will simply check that there is a date of birth and its not in the future
    const validate_dob = (dob) => {
        
        if (dob.length === 0) {
            return false;
        }
        const today = new Date();
        const user_dob = new Date(dob);
        return today > user_dob;
    }

    let email_valid = validate_email(email);
    let email_class = email_valid ? "is-valid" : "is-invalid";
    // This is needed because email field can be invalid for two reasons. This is for invalid email
    if (email_valid === false) {
        $("#email-invalid-feedback").innerHTML = "Please enter a valid email address";
    }
    validate_element("#email", email_class);
    let username_valid = validate_username(username);
    let username_class = username_valid ? "is-valid" : "is-invalid";
    // This is needed because there are two ways username field could be invalid: invalid username or username taken
    if (username_valid === false) {
        $("#username-invalid-feedback").innerHTML = "Please enter a username of length 1-30, using only: letters, numbers and underscores";
    }
    validate_element("#username", username_class);
    // Validate password
    let temp = validate_passwords(password, confirmPassword);
    let password_class = temp.password_valid ? "is-valid" : "is-invalid";
    let confirmPassword_class = temp.passwords_match ? "is-valid" : "is-invalid";
    validate_element("#password", password_class);
    validate_element("#confirm-password", confirmPassword_class);
    // Validate date of birth
    let dob_valid = validate_dob(dob);
    let dob_class = dob_valid ? "is-valid" : "is-invalid";
    validate_element("#date-of-birth", dob_class);
    let agreements_class = terms_agreement_checked ? "is-valid" : "is-invalid";
    validate_element("#terms-agreement", agreements_class);
    // Guarding clause, to prevent execution of next code if any of inputs are invalid
    if (email_valid === false || username_valid === false || temp.password_valid === false
        || temp.passwords_match === false || dob_valid === false || terms_agreement_checked === false) {
        return null;
    }
    let code = await register(username, email, password, dob);
    // This means that the chosen username is already taken
    if (code === 2){
        $("#username-invalid-feedback").innerHTML = "Please choose a different username, as this username is already taken";
        validate_element("#username", "is-invalid");
    }
    // This means the chosen email is taken
    else if(code === 3){
        $("#email-invalid-feedback").innerHTML = "Please choose a different email address, as an account with this email address already exists";
        validate_element("#email", "is-invalid");
    }
    // This means successfully registered
    else if(code === 1){
        // Push alert to alert box with successfull register message
        let alert = `
        <div class="alert alert-success alert-dismissible fade show flex-horizontal align-center" role="alert">
            <span class="material-icons">
                error
            </span>
            <span style="margin-left: 0.8rem">Account with username: ${username} has been successfully registered!</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `
        let alert_box = delete_dom_children("#alert-box");
        alert_box.insertAdjacentHTML("beforeend", alert);
    }
}