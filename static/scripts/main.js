function register(username, email, password, date_of_birth) {
    fetch("/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
            date_of_birth: date_of_birth
        })
    })
    .then(result => result.json())
    .then(result => {
        console.log(result);
    })
}

function login(identifier, password) {
    fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            {
                identifier: identifier,
                password: password,
                client_identifier: localStorage.getItem("client_identifier")
            }
        )
    })
    .then(result => result.json())
    .then(result => {
        console.log(result);
    })
}
function create_client_identifier() {
    let temp = localStorage.getItem("client_identifier");
    if (temp === null) {
        fetch("/auth/generate_client_identifier", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(result => result.json())
        .then(result => {
            localStorage.setItem("client_identifier", result.client_identifier);
        })
    }

}
function logout() {
    fetch("/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(result => result.json())
    .then(result => {
        console.log(result);
        location.reload()
    })
}
function get_user_info() {
    fetch("/auth/get_user_info", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(result => result.json())
    .then(result => {
        console.log(result);
    })
}
create_client_identifier()
get_user_info()
// register("egorcik", "egorch.formal@gmail.com", "123qwe", "02/12/2001")
// register("julia", "jul.f@manchester.ac.uk", "polo157gfd$", "03/10/2003")
// login("egorcik", "123qwe")
// login("jul.f@manchester.ac.uk", "polo157gfd$")