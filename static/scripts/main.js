fetch("/auth/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        username: 'egorcik',
        email: 'egorcik@gmail.com',
        password: 'password',
        date_of_birth: '02/12/2001'
    })
})
.then(result => result.json())
.then(result => {
    console.log(result);
})
