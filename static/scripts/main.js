function register(username, email, password, date_of_birth){
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

function login(identifier, password){
    fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({identifier: identifier, password: password})
    })
    .then(result => result.json())
    .then(result => {
        console.log(result);
    })
}

// register("egorcik", "egorch.formal@gmail.com", "123qwe", "02/12/2001")
// register("julia", "jul.f@manchester.ac.uk", "polo157gfd$", "03/10/203")
// login("egorcik", "123qwe")