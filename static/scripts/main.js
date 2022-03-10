let auth_info = {};
let page_state = "";
let rating_limit = 10;
// This makes it possible to go back using the back button in hte browser, using history api
window.onpopstate = (ev) => {
    let state = ev.state;
    change_page_state(state.page_state);
};

async function get_all_blog_tiles_data(){
    return fetch("/api/blog/get_all_blog_tiles_data", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });
}

async function get_certain_blog_tiles_data(blog_ids){
    return fetch(`/api/blog/get_blog_tiles_from_blog_ids/${JSON.stringify(blog_ids)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });
}

// Jquery like selection, because I like it
function $(selector) {
    return document.querySelector(selector);
}

// Deletes all children from element
function delete_dom_children(identifier) {
    let element = $(identifier);
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    return element;
}

// Creates a unique identifier for client
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

// Logs the client out of their account. Send request to "auth/logout" server route.
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

// Get details of the currently logged user. Send request to "auth/userinfo" server route.
function get_user_info() {
    return fetch("/auth/get_user_info", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((result) => result.json())
        .then((result) => {
            return result;
        });
}

function insert_blog_tile(
    blog_data, identifier
) {
    // <div class="flex-vertical align-center">
    //                 <span>Date created:</span>
    //                 <strong>${date_created}</strong>
    //             </div>
    blog_data.average_controversial_rating = Number(blog_data.average_controversial_rating.toFixed(1))
    blog_data.average_relevancy_rating = Number(blog_data.average_relevancy_rating.toFixed(1))
    blog_data.average_impression_rating = Number(blog_data.average_impression_rating.toFixed(1))
    let controversial_percentage = `${(blog_data.average_controversial_rating / rating_limit * 100).toFixed(2)}%`;
    let relevancy_percentage = `${(blog_data.average_relevancy_rating / rating_limit * 100).toFixed(2)}%`;
    let impression_percentage = `${(blog_data.average_impression_rating / rating_limit * 100).toFixed(2)}%`;
    let blog_tile_dom_string = `
    <div class="blog-tile animate__animated animate__fadeIn" id="blog-tile-${blog_data.blog_id}" onclick="change_page_state('/blog/${DOMPurify.sanitize(blog_data.blog_id)}')">
        <div class="blog-tile-top">
            <div class="flex-vertical align-center blog-tile-left" style="word-break:break-all">
                <img class="author-avatar" src="/images/avatar_${blog_data.avatar_image_id}.webp">
                <div class="flex-vertical align-center">
                    <span>Created by:</span>
                    <strong class="username"></strong>
                </div>
                
                <div class="flex-vertical align-center">
                    <span>Word count:</span>
                    <strong>${blog_data.word_count}</strong>
                </div>
                
                <div class="flex-vertical align-center">
                    <span>Views:</span>
                    <strong>${blog_data.views}</strong>
                </div>
            </div>
            <div>
                <div class="flex-vertical align-center blog-tile-right height-full">
                    <div class="flex-horizontal align-center width-full">
                        <h5 style="flex-grow:1; text-align:center;" class="category">
                            
                        </h5>
                        
                        <img src="/images/flag.png" class="controversy-flag" style="opacity: ${controversial_percentage}">
                    </div>
                    <div class="flex-horizontal align-center width-full">
                        <h4 style="text-align: center; flex-grow: 1" class="blog-title">
                            
                        </h4>
                        <span style="font-size: 0.9em; text-align: center">
                            (№ ratings: <strong>${blog_data.number_ratings}</strong>)
                        </span>
                    </div>
                    
                    <div class="blog-tile-ratings-grid width-full">

                    
                        <div class="flex-vertical align-center">
                            <span>Controversial: </span>
                        </div>
                        
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${controversial_percentage};background-color:red">
                            </div>
                        </div>
                        <div class="flex-vertical align-center">
                            <strong>${blog_data.average_controversial_rating}/${rating_limit}</strong>
                        </div>
                        

                    
                    
                        <div class="flex-vertical align-center">
                            <span>Relevancy: </span>
                        </div>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${relevancy_percentage};background-color:blue">
                            </div>
                        </div>
                        <div class="flex-vertical align-center">
                            <strong>${blog_data.average_relevancy_rating}/${rating_limit}</strong>
                        </div>

                    
                    
                        <div class="flex-vertical align-center">
                            <span>Impression: </span>
                        </div>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${impression_percentage};background-color:green">
                            </div>
                        </div>
                        <div class="flex-vertical align-center">
                            <strong>${blog_data.average_impression_rating}/${rating_limit}</strong>
                        </div>

                    </div>
                    
                </div>
                
            </div>
        </div>
    </div>
    `;
    $(identifier).insertAdjacentHTML("beforeend", blog_tile_dom_string);
    $(`#blog-tile-${blog_data.blog_id} .username`).insertAdjacentText("beforeend", blog_data.username)
    $(`#blog-tile-${blog_data.blog_id} .category`).insertAdjacentText("beforeend", blog_data.category)
    $(`#blog-tile-${blog_data.blog_id} .blog-title`).insertAdjacentText("beforeend", blog_data.blog_title)
}

async function get_all_blog_tiles() {
    let return_dom_string = ``
    let temp = await get_all_blog_tiles_data();
    if (temp.code != 1) {
        return { dom_string: "" }
    }
    
    let all_blog_tiles_data = temp.data
    all_blog_tiles_data.forEach((blog_data, index) => {
        insert_blog_tile(blog_data, "#blog_tiles")
    })
    return { dom_string: return_dom_string, data: all_blog_tiles_data }
}

// This changes page state depending on the url. So makes possible to go straight to some page
function initialize_page_state() {
    let path = document.location.pathname;
    
    if (path === "/") {
        change_page_state("/home");
    } else if (path === "/home") {
        change_page_state("/home");
    } else if (path === "/login-register") {
        change_page_state("/login");
    } else if (/^\/profile\/(?<username>.+)$/.test(path)) {
        change_page_state(path);
    } else if (/^\/edit_blog\/\d+$/.test(path)) {
        change_page_state(path);
    } else if (/^\/blog\/\d+$/.test(path)) {
        change_page_state(path)
    } else if (/^\/recover_password\/(?<user_id>\d+)\/(?<recovery_token>.+)$/.test(path)) {
        change_page_state(path);
    } else if (path === "/aboutus") {
        change_page_state("/aboutus");
    } else if(/^\/search$/.test(path)){
        change_page_state(path + location.search);
    }
}

/*
Change page state
Page States:
"/home": Home
"/login": Login
"/about_us": About us
"/profile/<username>": Profile of a certain username
"/edit_blog/<blog_id>": Edit some blog
"/blog/<blog_id>": View blog
*/
async function change_page_state(new_state) {
    // If trying to switch to the same state, no need to do anything
    if (new_state === page_state) {
        return null;
    }
    console.log(page_state + " -> " + new_state);
    page_state = new_state;

    // Remove all elements from main
    let main_html = delete_dom_children("main");
    remove_alert();
    if (new_state === "/login") {
        let login_domstring = `
            <div class='login-page-container flex-vertical align-center'>
                <div class="auth-grid">
                    <div id="alert-box" class="flex-vertical align-center">
                        
                    </div>
                    
                </div>
                
            </div>
        `;
        history.pushState({ page_state: page_state }, null, "/login-register");
        main_html.insertAdjacentHTML("beforeend", login_domstring);
        change_login_page_state("login");

    } else if (new_state === "/home") {
        let create_blog_dom_string = `
        <button class="btn btn-outline-primary profile-control-button flex-horizontal align-center" id="create-blog-btn" type="button" tabindex="0">
            <span class="material-icons">
            article
            </span>
            Create new blog
        </button>
        `

        let home_domstring = `
        <div id="home-container">
            ${(auth_info.username != null) ? create_blog_dom_string : ""}
            <div class="flex-horizontal align-center margin-children flex-wrap" id="blog_tiles">
                
            </div>
        </div>
        `;

        history.pushState({ page_state: page_state }, null, "/home");
        main_html.insertAdjacentHTML("beforeend", home_domstring);
        if (auth_info.username != null) {
            $("#create-blog-btn").onclick = async function () {
                let result = await create_blog(
                    {
                        blog_body: { text: "Default" },
                        blog_title: "Default",
                        category: "testing",
                        word_count: 1
                    }
                )
                if (result.code === 1) {
                    change_page_state(`/edit_blog/${result.blog_id}`);
                }


            }
        }
        get_all_blog_tiles();
        
        



    } else if (/^\/profile\/.+$/.test(new_state)) {
        let temp = /^\/profile\/(?<username>.+)$/.exec(new_state);

        if (temp === null) {
            return null;
        }
        let username = temp.groups.username;
        let profile_domstring = `
            <div id="profile-container" class="animate__animated animate__fadeIn">
                <div id="profile-control-container" >
                </div>
                <div class="profile-header-container flex-vertical align-center">
                    <div id="profile-avatar-container" class="flex-vertical align-center">  
                        <img id="avatar-img">
                    </div>
                    
                    <h4 id="username-text"></h4>
                    <h5 id="date-created"></h5>
                    <h5 id="date-last-accessed"></h5>
                    
                </div>
                <div id="personal-description-container" class="flex-vertical">
                    <h3 style="text-align: center">Personal Description</h3>
                    <div id="profile-description-text" class="profile-description-box">
                    </div>
                </div>
                <div class="flex-vertical align-center" style="grid-column: 1 / 3;">
                    
                    <h3 style="text-align: center">Authored Blogs</h3>
                    <span class="width-full flex-horizontal" style="justify-content:flex-end">Blogs shown: <strong id="blogs-shown" style="margin-left:2px">?/?</strong></span>
                    
                    
                    <div id="authored-blogs-container" class="flex-horizontal align-center flex-wrap">
                        
                    </div>
                </div>
            </div>
        `;
        history.pushState(
            { page_state: page_state },
            null,
            `/profile/${username}`
        );
        main_html.insertAdjacentHTML("beforeend", profile_domstring);
        profile_main(username);
    }
    else if (/^\/edit_blog\/\d+$/.test(new_state)) {
        let temp = /^\/edit_blog\/(?<blog_id>\d+)$/.exec(new_state);

        if (temp === null) {
            return null;
        }
        let blog_id = temp.groups.blog_id;
        let edit_blog_dom_string = `
        <div id="edit-blog-container" class="animate__animated animate__fadeIn">
        </div>
        `
        history.pushState({ page_state: page_state }, null, `/edit_blog/${blog_id}`);
        main_html.insertAdjacentHTML("beforeend", edit_blog_dom_string);
        render_edit_blog(blog_id);
    }
    else if (/^\/blog\/\d+$/.test(new_state)) {
        let temp = /^\/blog\/(?<blog_id>\d+)$/.exec(new_state);
        if (temp === null) {
            return null;
        }
        let blog_id = temp.groups.blog_id;
        let view_blog_dom_string = `
        <div id="view-blog-container" class="animate__animated animate__fadeIn flex-vertical" style="align-items:center">
        </div>
        `
        history.pushState({ page_state: page_state }, null, `/blog/${blog_id}`);
        main_html.insertAdjacentHTML("beforeend", view_blog_dom_string);
        render_view_blog(blog_id);

    }
    else if (/^\/recover_password\/(?<user_id>\d+)\/(?<recovery_token>.+)$/.test(new_state)) {
        let temp = /^\/recover_password\/(?<user_id>\d+)\/(?<recovery_token>.+)$/.exec(new_state);
        if (temp === null) {
            return null;
        }
        let user_id = temp.groups.user_id;
        let recovery_token = temp.groups.recovery_token;
        let recover_password_dom_string = `
        <div class='login-page-container flex-vertical align-center'>
            <div class="auth-grid">
                <div id="alert-box" class="flex-vertical align-center">
                    
                </div>
                
            </div>
                
        </div>
        `
        history.pushState({ page_state: page_state }, null, `/recover_password/${user_id}/${recovery_token}`);
        main_html.insertAdjacentHTML("beforeend", recover_password_dom_string);
        render_recover_password(user_id, recovery_token);
    }
    else if (new_state === "/aboutus") {
        let aboutus = `
        <div class="section">
        <div class="container">
            <div class="content-section">
                <div class="header">
                    <a href="/">
                    <div class="nav-logo-container flex-horizontal">
                    <img src="/images/logo.webp" alt="OpenThoughtFloor logo">
                    </div>
                    <h1>Open Thought Floor</h1>
                    </a>
                    <i class="fa-regular fa-user fa-lg"></i>
                    <i class="fa-solid fa-magnifying-glass fa-lg"></i>
                </div>
                <div class="about-us">
                    <h2>About Us</h2>
                    <p>OTF is a user-curated, metadata-rich, freedom of speech oriented blogging platform.
                        OTF offers a light, clean, elegant interface for you to have the most incredible reading
                        experience. Our team aims to provide the most functional blogging platform in the world, typically
                        with
                        <span class="br"></span>
                        <ul>
                            <li>
                                User Ratings
                            </li>
                            <li>
                                Extensive blog content customization
                            </li>
                            <li>
                                Accurate recommendations
                            </li>
                            <li>
                                Comments, etc.
                            </li>
                        </ul>
                        Users have options to choose the right blog for them based on the author’s
                        profile and other users’ ratings. OTF will be officially launched soon.</p>
                </div>
                <div class="team-members">
                    <h2>Our Team</h2>
                    <h3>Egor Chernyshev</h3>
                    <h3>Henry Bowman</h3>
                    <h3>Archawudh Eamsureya</h3>
                    <h3>Bryn Dowton</h3>
                    <h3>Daniel Gobel</h3>
                    <h3>Junle Yu</h3>
                    <h3>Arun John</h3>
                </div>
            </div>
        </div>
    </div>
        `
        history.pushState({ page_state: page_state }, null, "/aboutus");
        main_html.insertAdjacentHTML("beforeend", aboutus);
    }
    else if(/^\/search\?(?<search_query>.*)$/.test(new_state)){
        let temp = /^\/search\?(?<search_query>.*)$/.exec(new_state)
        if (temp === null) {
            return null;
        }
        let search_domstring = `
        <div id="search-page" class="flex-vertical align-center">
            <h3 style="text-align: center">Search results</h3>
            <span class="width-full flex-horizontal" style="justify-content:flex-end">Blogs shown: <strong id="blogs-shown" style="margin-left:2px">?/?</strong></span>
            <div id="authored-blogs-container" class="flex-horizontal align-center flex-wrap">
                        
            </div>
        </div>
        
        `
        let search_query = temp.groups.search_query
        history.pushState({ page_state: page_state }, null, new_state);
        main_html.insertAdjacentHTML("beforeend", search_domstring);
        render_search_page(search_query);
    }
}

// Called after userinfo is loaded. Initializes the page
async function main() {
    // Insert either a profile nav element or login nav element depending on authentication info
    let nav_element = $("nav");
    if (auth_info.username != null) {
        let profile_domstring = `
            <button class="nav-item-container nav-button flex-horizontal" role="navigation" tabindex="0" id="profile">

                <span class="material-icons">
                    account_circle
                </span>
                <span class="nav-heading">
                    Profile
                </span>
            
            </button>
        `;
        nav_element.insertAdjacentHTML("beforeend", profile_domstring);
        $("#profile").onclick = () => {
            change_page_state(`/profile/${auth_info.username}`);
        };
    } else {
        let login_domstring = `
            <button class="nav-item-container nav-button flex-horizontal" id="login" role="navigation" tabindex="0">

            <span class="material-icons">
                login
            </span>
            <span class="nav-heading">
                Login/Register
            </span>
            </button>
        `;
        nav_element.insertAdjacentHTML("beforeend", login_domstring);
        $("#login").onclick = () => {
            change_page_state("/login");
        };
    }
    $("#home-btn").onclick = () => {
        change_page_state("/home");
    };
    $("#about-us-btn").onclick = () => {
        change_page_state("/aboutus");
    };
    $("#search-bar").onsubmit = (ev) => 
    {
        ev.preventDefault();
        on_simple_search_click()
    };
    initialize_page_state();
}

create_client_identifier();
let details_promise = get_user_info();

// When all static content is loaded
document.addEventListener("DOMContentLoaded", (event) => {
    // need to have details ready before executing main
    if (shouldShowPopup()) {
        switchcookie();
    }
    // If agree to google analytics, then initiate google magic
    if (storage_cookie.getItem("analytics_accepted_value") === "Yes") {
        var my_awesome_script = document.createElement('script');

        my_awesome_script.setAttribute('src', 'https://www.googletagmanager.com/gtag/js?id=G-GSB3D915WS%27');

        document.head.appendChild(my_awesome_script);
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-GSB3D915WS');
    }
    details_promise.then((user_details) => {
        auth_info = user_details;
        main();
    });

});
// register("egorcik", "egorch.formal@gmail.com", "123qwe", "02/12/2001")
// register("julia", "jul.f@manchester.ac.uk", "polasdfsdfdsasfad14F141$$$", "2021-03-21")
// login("egorcik", "123qwe")
// login("jul.f@manchester.ac.uk", "polo157gfd$")
