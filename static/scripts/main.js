let auth_info = {};
let page_state = "";
let rating_limit = 10;
// This makes it possible to go back using the back button in hte browser, using history api
window.onpopstate = (ev) => {
    let state = ev.state;
    change_page_state(state.page_state);
};


async function get_all_blog_tiles_data() {

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

async function get_certain_blog_tiles_data(blog_ids) {
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
async function check_user_banned(user_id){
    return fetch(`/api/users/get_banned/${user_id}`,{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then((result) => result.json())
        .then((result) => {
            return result
        })
}

// Jquery like selection, because I like it
function $(selector) {
    return document.querySelector(selector);
}

// Deletes all children from element
function delete_dom_children(identifier) {
    let element = $(identifier);
    if (element == null){
        return null;
    }
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

async function register_activity() {
    return fetch("/auth/register_activity", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then((result) => result.json())
        .then((result) => {
            return result
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
    <div class="blog-tile animate__animated animate__fadeIn" id="blog-tile-${blog_data.blog_id}" onclick="change_page_state('/blog/${blog_data.blog_id}')">
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
                        <h6 style="flex-grow:1; text-align:center;" class="category">
                            
                        </h6>
                        
                        <img src="/images/flag.png" class="controversy-flag" style="opacity: ${controversial_percentage}">
                    </div>
                    <div class="flex-horizontal align-center width-full">
                        <h5 style="text-align: center; flex-grow: 1" class="blog-title">
                            
                        </h5>
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
    $(`${identifier} #blog-tile-${blog_data.blog_id} .username`).insertAdjacentText("beforeend", blog_data.username)
    $(`${identifier}  #blog-tile-${blog_data.blog_id} .category`).insertAdjacentText("beforeend", categories_hashmap[blog_data.category_id])
    $(`${identifier}  #blog-tile-${blog_data.blog_id} .blog-title`).insertAdjacentText("beforeend", blog_data.blog_title)
}

async function get_all_blog_tiles() {
    let return_dom_string = ``
    let temp = await get_all_blog_tiles_data();

    if (temp.code != 1) {
        return { dom_string: "" }
    }

    let all_blog_tiles_data = temp.data

    all_blog_tiles_data.sort((a, b) => {
        return b.algorithm_info.score - a.algorithm_info.score
    })
    console.log(all_blog_tiles_data)
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
    } else if (path === "/legalpage") {
        change_page_state("/legalpage");
    } else if (path === "/termsandcons") {
        change_page_state("/termsandcons");
    } else if (path === "/contentguidelines") {
        change_page_state("/contentguidelines");
    } else if (/^\/search$/.test(path)) {
        change_page_state(path + location.search);
    }else if(path === "/admin"){
        change_page_state("/admin");
    } else if (path === "/advancedsearch") {
        change_page_state("advancedsearch");
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
            <div id="random-blog" class="flex-vertical align-center">
                <div class="flex-horizontal align-center">
                    <h4>Random blog, discover something new!</h4>
                    <button class="flex-horizontal align-center btn btn-outline-primary" id="new-random-blog-btn" style="margin-left: 1rem; font-size: 0.8em;">
                        <span class="material-icons">
                        refresh
                        </span>
                        New
                    </button>
                </div>
    
            </div>
            
        </div>
        `;

        history.pushState({ page_state: page_state }, null, "/home");
        main_html.insertAdjacentHTML("beforeend", home_domstring);
        if (auth_info.username != null) {
            $("#create-blog-btn").onclick = async function () {
                let banned = await(check_user_banned(auth_info.user_id))
                if(auth_info.user_banned === true){
                    alert("You are banned from creating any content.")
                    return null
                }
                else{
                    let result = await create_blog(
                        {
                           blog_body: { text: "Default" },
                            blog_title: "Default",
                            category_id: categories_object[0].category_id,
                            word_count: 1
                        }
                    )
                    if (result.code === 1) {
                        change_page_state(`/edit_blog/${result.blog_id}`);
                    }
                }
            }
        }
        render_all_recommends();





    } else if (/^\/profile\/.+$/.test(new_state)) {
        let temp = /^\/profile\/(?<username>.+)$/.exec(new_state);

        if (temp === null) {
            return null;
        }
        let username = temp.groups.username;
        let profile_domstring = `
        <div class="flex-vertical">
        
            <div id="profile-control-container" >
            </div>
            <div id="profile-container" class="animate__animated animate__fadeIn width-full">
                
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
    else if (new_state === "/legalpage") {
        let legalpage = `
        <div class="termsandconssection">
        <div class="termsandconscontainer">
            <div class="content-section">
                <div class="termsandconsheader">
                    <a href="/" class="hoverable-text">
                    <h1>Open Thought Floor</h1>
                    </a>
                </div>
                <div class="termsandconscontent">
                    <h1>Legal Page</h1>
                    <h2>TERMS AND CONDITIONS</h2>
                    <p>
                     You can refer to our Terms and Conditions page:
                        <a href="/termsandcons" class="hoverable-text">Terms and Conditions</a>
                    </p>
                    <span class="br"></span>

                    <h2>CONTENT GUIDELINES</h2>
                    <p>
                     You can refer to our Content Guidelines page:
                        <a href="/contentguidelines" class="hoverable-text">Content Guidelines</a>
                    </p>
                <div>
                <h2>Userway</h2>
                <p>
                We use Userway software for accessibility improvement. You can refer to Userway's legal documents: 
                    <a href="https://userway.org/terms/" class="hoverable-text">Terms and Conditions</a>
                    <a href="https://userway.org/privacy/" class="hoverable-text"> Privacy Policy </a>
                </p>
                    
                </div>
                <div>
                <h2>Hcaptcha</h2>
                <p>
                This site is protected by hCaptcha and its
                    <a href="https://hcaptcha.com/privacy" class="hoverable-text">Privacy Policy</a> and
                    <a href="https://hcaptcha.com/terms" class="hoverable-text">Terms of Service</a> apply.
                </p>
                </div>
                </div>
                
            </div>
        </div>
</div>
        `
        history.pushState({ page_state: page_state }, null, "/legalpage");
        main_html.insertAdjacentHTML("beforeend", legalpage);
    }
    else if (new_state === "/termsandcons") {
        let termsandcons = `
        <div class="termsandconssection">
        <div class="termsandconscontainer">
            <div class="termsandconscontent-section">
                <div class="termsandconsheader">
                    <a href="/" class="hoverable-text">
                    <h1>Open Thought Floor</h1>
                    </a>
                </div>
                <div class="termsandconscontent">
                    <h1>TERMS AND CONDITIONS</h1>
                    <h2>1. AGREEMENT TO TERMS</h2>
                    <p>
                        <span class="br"></span>
                        These Terms of Use constitute a legally binding agreement made between you, whether personally
                        or on behalf of an entity (“you”) and OTF ("Company," “we," “us," or “our”), concerning your
                        access to and use of the http://www.otf.com website as well as any other media form, media
                        channel, mobile website or mobile application related, linked, or otherwise connected thereto
                        (collectively, the “Site”).
                        You agree that by accessing the Site, you have read, understood, and agreed to be bound by all
                        of these Terms of Use. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF USE, THEN YOU ARE
                        EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
                        <span class="br"></span>
                        Supplemental terms and conditions or documents that may be posted on the Site from time to time
                        are hereby expressly incorporated herein by reference. We reserve the right, in our sole
                        discretion, to make changes or modifications to these Terms of Use from time to time.
                        Please ensure that you check the applicable Terms every time you use our Site so that you
                        understand which Terms apply. You will be subject to, and will be deemed to have been made
                        aware of and to have accepted, the changes in any revised Terms of Use by your continued use of
                        the Site after the date such revised Terms of Use are posted.
                        <span class="br"></span>
                        The information provided on the Site is not intended for distribution to or use by any person or
                        entity in any jurisdiction or country where such distribution or use would be contrary to law or
                        regulation or which would subject us to any registration requirement within such jurisdiction or
                        country. Accordingly, those persons who choose to access the Site from other locations do so on
                        their own initiative and are solely responsible for compliance with local laws, if and to the
                        extent local laws are applicable.
                        <span class="br"></span>
                        All users who are minors in the jurisdiction in which they reside (generally under the age of 18
                        ) must have the permission of, and be directly supervised by, their parent or guardian to use the Site. If you are a minor, you must have your parent or guardian read and agree to these Terms of Use prior to you using the Site.
                    </p>

                    <h2>2. INTELLECTUAL PROPERTY RIGHTS</h2>
                    <p>
                        <span class="br"></span>
                        Unless otherwise indicated, the Site is our proprietary property and all source code, databases,
                        functionality, software, website designs, audio, video, text, photographs, and graphics on the
                        Site (collectively, the “Content”) and the trademarks, service marks, and logos contained
                        therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by
                        copyright and trademark laws and various other intellectual property rights and unfair
                        competition laws of the United States, international copyright laws, and international
                        conventions. The Content and the Marks are provided on the Site “AS IS” for your information
                        and personal use only. Except as expressly provided in these Terms of Use, no part of the Site
                        and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted,
                        publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise
                        exploited for any commercial purpose whatsoever, without our express prior written permission.
                        <span class="br"></span>
                        Provided that you are eligible to use the Site, you are granted a limited license to access and
                        use the Site and to download or print a copy of any portion of the Content to which you have
                        properly gained access solely for your personal, non-commercial use. We reserve all rights not
                        expressly granted to you in and to the Site, the Content and the Marks.
                    </p>

                    <h2>3. USER REPRESENTATIONS</h2>
                    <p>
                        <span class="br"></span>
                    By using the Site, you represent and warrant that: (1) all registration information you submit will
                        be true, accurate, current, and complete; (2) you will maintain the accuracy of such information
                        and promptly update such registration information as necessary; (3) you have the legal capacity
                        and you agree to comply with these Terms of Use; (4) you are not a minor in the jurisdiction in
                        which you reside, or if a minor, you have received parental permission to use the Site; (5) you
                        will not access the Site through automated or non-human means, whether through a bot, script, or
                        otherwise; (6) you will not use the Site for any illegal or unauthorized purpose; and (7) your
                        use of the Site will not violate any applicable law or regulation.
                        <span class="br"></span>
                    If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the
                        right to suspend or terminate your account and refuse any and all current or future use of the
                        Site (or any portion thereof).
                    </p>

                    <h2>4. USER REGISTRATION</h2>
                    <p>
                        <span class="br"></span>
                        You may be required to register with the Site. You agree to keep your password confidential and
                        will be responsible for all use of your account and password. We reserve the right to remove,
                        reclaim, or change a username you select if we determine, in our sole discretion, that such
                        username is inappropriate, obscene, or otherwise objectionable.
                    </p>


                    <h2>5. USER GENERATED CONTRIBUTIONS</h2>
                    <p>
                        <span class="br"></span>
                        The Site may invite you to chat, contribute to, or participate in blogs, message boards, online
                        forums, and other functionality, and may provide you with the opportunity to create, submit,
                        post, display, transmit, perform, publish, distribute, or broadcast content and materials to
                        us or on the Site, including but not limited to text, writings, video, audio, photographs,
                        graphics, comments, suggestions, or personal information or other material (collectively,
                        "Contributions"). Contributions may be viewable by other users of the Site and through
                        third-party websites. As such, any Contributions you transmit may be treated as non-confidential
                        and non-proprietary. When you create or make available any Contributions, you thereby represent
                        and warrant that:
                        <span class="br"></span>
                        <span class="br1"></span>
                        ● The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.
                        <span class="br1">
                        ● You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the Site, and other users of the Site to use your Contributions in any manner contemplated by the Site and these Terms of Use.</span>
                        <span class="br1">
                        ● You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Site and these Terms of Use.
                        </span>
                        <span class="br1">
                        ● Your Contributions are not false, inaccurate, or misleading.
                        </span>
                        <span class="br1">
                        ● Your Contributions are not unsolicited or unauthorized advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.
                        </span>
                        <span class="br1">
                          ● Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).
                        </span>
                        <span class="br1">
                            ● Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.
                        </span>
                        <span class="br1">
                        ● Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and to promote violence against a specific person or class of people.
                        </span>
                        <span class="br1">
                           ● Your Contributions do not violate any applicable law, regulation, or rule.
                        </span>
                        <span class="br1">
                            ● Your Contributions do not violate the privacy or publicity rights of any third party.
                        </span>
                        <span class="br1">
                            ● Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.
                        </span>
                         <span class="br1">
                             ● Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.
                         </span>
                         <span class="br1">
                             ● Your Contributions do not otherwise violate, or link to material that violates, any provision of these Terms of Use, or any applicable law or regulation.
                         </span>
                        <span class="br">
                          ● Any use of the Site in violation of the foregoing violates these Terms of Use and may result in, among other things, termination or suspension of your rights to use the Site.
                        </span>
                    </p>


                    <h2>6. GUIDELINES FOR REVIEWS</h2>
                    <p>
                        <span class="br">
                            We may provide you areas on the Site to leave reviews or ratings. When posting a review, you must comply with the following criteria: (1) you should have firsthand experience with the person/entity being reviewed; (2) your reviews should not contain offensive profanity, or abusive, racist, offensive, or hate language; (3) your reviews should not contain discriminatory references based on religion, race, gender, national origin, age, marital status, sexual orientation, or disability; (4) your reviews should not contain references to illegal activity; (5) you should not be affiliated with competitors if posting negative reviews; (6) you should not make any conclusions as to the legality of conduct; (7) you may not post any false or misleading statements; and (8) you may not organize a campaign encouraging others to post reviews, whether positive or negative.
                        </span>

                        <span class="br">
                            We may accept, reject, or remove reviews in our sole discretion. We have absolutely no obligation to screen reviews or to delete reviews, even if anyone considers reviews objectionable or inaccurate. Reviews are not endorsed by us, and do not necessarily represent our opinions or the views of any of our affiliates or partners. We do not assume liability for any review or for any claims, liabilities, or losses resulting from any review. By posting a review, you hereby grant to us a perpetual, non-exclusive, worldwide, royalty-free, fully-paid, assignable, and sublicensable right and license to reproduce, modify, translate, transmit by any means, display, perform, and/or distribute all content relating to reviews.
                        </span>
                    </p>


                    <h2>7. SUBMISSIONS</h2>
                    <p>
                        <span class="br">
                            You acknowledge and agree that any questions, comments, suggestions, ideas, feedback, or other information regarding the Site ("Submissions") provided by you to us are non-confidential and shall become our sole property. We shall own exclusive rights, including all intellectual property rights, and shall be entitled to the unrestricted use and dissemination of these Submissions for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you. You hereby waive all moral rights to any such Submissions, and you hereby warrant that any such Submissions are original with you or that you have the right to submit such Submissions. You agree there shall be no recourse against us for any alleged or actual infringement or misappropriation of any proprietary right in your Submissions.
                        </span>
                    </p>

                    <h2>8. SITE MANAGEMENT</h2>
                    <p>
                        <span class="br">We reserve the right, but not the obligation, to: (1) monitor the Site for violations of these Terms of Use; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Terms of Use, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Site or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Site in a manner designed to protect our rights and property and to facilitate the proper functioning of the Site.</span>
                    </p>


                    <h2>9. PRIVACY POLICY</h2>
                    <p>
                        <span class="br">
                        We care about data privacy and security. Please review our Privacy Policy: __________. By using the Site, you agree to be bound by our Privacy Policy, which is incorporated into these Terms of Use. Please be advised the Site is hosted in the United Kingdom. If you access the Site from any other region of the world with laws or other requirements governing personal data collection, use, or disclosure that differ from applicable laws in the United Kingdom, then through your continued use of the Site, you are transferring your data to the United Kingdom, and you agree to have your data transferred to and processed in the United Kingdom.
                        </span>
                    </p>


                     <h2>10. MODIFICATIONS AND INTERRUPTIONS</h2>
                    <p>
                        <span class="br">
                        We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Site. We also reserve the right to modify or discontinue all or part of the Site without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
                        </span>

                        <span class="br">
                        We cannot guarantee the Site will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Site, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Site at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Site during any downtime or discontinuance of the Site. Nothing in these Terms of Use will be construed to obligate us to maintain and support the Site or to supply any corrections, updates, or releases in connection therewith.
                        </span>
                    </p>

                     <h2>11. USER DATA</h2>
                    <p>
                        <span class="br">
                        We will maintain certain data that you transmit to the Site for the purpose of managing the performance of the Site, as well as data relating to your use of the Site. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Site. You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.
                        </span>

                    </p>

                     <h2>12. MISCELLANEOUS</h2>
                    <p>
                        <span class="br">
                        These Terms of Use and any policies or operating rules posted by us on the Site or in respect to the Site constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Terms of Use shall not operate as a waiver of such right or provision. These Terms of Use operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. If any provision or part of a provision of these Terms of Use is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Terms of Use and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Terms of Use or use of the Site. You agree that these Terms of Use will not be construed against us by virtue of having drafted them. You hereby waive any and all defenses you may have based on the electronic form of these Terms of Use and the lack of signing by the parties hereto to execute these Terms of Use.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </div>

        `
        history.pushState({ page_state: page_state }, null, "/termsandcons");
        main_html.insertAdjacentHTML("beforeend", termsandcons);
    }
    else if (new_state === "/contentguidelines") {
        let contentguidelines = `
        <div class="contentsection">
        <div class="contentcontainer">
            <div class="content-section">
                <div class="contentheader">
                    <a href="/" class="hoverable-text">
                    <h1>Open Thought Floor</h1>
                    </a>
                </div>
                <div class="contentcontent">
                    <h1>CONTENT GUIDELINES</h1>
                    <h2>At OTF, we make our goal to provide people a platform where they can express their
                    opinions freely. We don’t want to censor people's opinions, but we do recognize that
                    some content can be harmful to other people’s wellbeing. As such, if your content is
                    found to be categorised in the below list, your blog will be deleted and your account
                    permanently terminated.</h2>
                    <h3>Prohibited</h3>
                    <p>
                        <span class="br"></span>
                        1)Threatening, or encouraging to threat a group or individuals with violence or
                        any other form of inappropriate actions such as doxing. Examples would be:
                        Encouraging readers to commit violence against conservative MPs. Encouraging
                        readers to send threats to a specific person.
                        <span class="br"></span>
                        2)Any sexual content involving minors. No sexual content, visual or text is allowed
                        to be posted if it contains minors.
                        <span class="br"></span>
                        3)Any content containing racial, gender and health discrimination. For example,
                        writing about any race superiority is strictly not allowed.
                    </p>

                    <h2>The following content will be allowed on our platform, but you must appropriately
                    categorise it, so that users are aware of the content and can avoid it.</h2>
                    <h3>Labelled</h3>
                    <p>
                        <span class="br"></span>
                        1)Anti-scientific content. Content that goes against the established scientific
                        consensus, such as Flat-earth theory
                        <span class="br"></span>
                        2)Political content. Examples would be: critique of any political figures or groups.
                        <span class="br"></span>
                        3)Visual sexually explicit content. We allow sexual content, as long as it does not
involve visual data. For example, sharing textual guidance on techniques is
allowed, but sharing pictures is prohibited.
                    </p>

                </div>
            </div>
        </div>
    </div>
        `
        history.pushState({ page_state: page_state }, null, "/contentguidelines");
        main_html.insertAdjacentHTML("beforeend", contentguidelines);
    }

    else if (/^\/search\?(?<search_query>.*)$/.test(new_state)) {
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
    else if(new_state === "/admin"){
        let admin_panel_domstring = `
        <div id="admin-page" class="flex-vertical align-center">
            <div class ="align-center flex-vertical">
                <div class = "container-head">Unresolved blog reports</div>
                <div style="margin-top: 1rem;" class="grid-5-cols margin-children flex-wrap reports-container">
                    <h5 class="flex-horizontal align-center" style="text-align: center">Blog id</h5>
                    <h5 class="flex-horizontal align-center" style="text-align: center">Most recent report date</h5>
                    <h5 class="flex-horizontal align-center" style="text-align: center">Report reaon(s)</h5>
                    <h5 class="flex-horizontal align-center" style="text-align: center">Number of reports on blog</h5>
                    <h5 class="flex-horizontal align-center" style="text-align: center">Most recent report description</h5>
                </div>
                <div id="report_blog_tiles" class="flex-vertical align-center width-full">
                    
                </div>
            </div>
            <div class ="flex-vertical align-center" style="margin-top: 3.5rem;">
                <div class = "container-head">Unresolved user reports</div>
                <div style="margin-top: 1rem;" class="grid-5-cols margin-children flex-wrap reports-container width-full">
                    <h5 class="flex-horizontal align-center" style="text-align: center">User id</h5>
                    <h5 class="flex-horizontal align-center" style="text-align: center">Most recent report date</h5>
                    <h5 class="flex-horizontal align-center" style="text-align: center">Report reaon(s)</h5>
                    <h5 class="flex-horizontal align-center" style="text-align: center">Number of reports on user</h5>
                    <h5 class="flex-horizontal align-center" style="text-align: center">Most recent report description</h5>
                </div>
                <div id="report_user_tiles" class="flex-vertical align-center width-full">
                    
                </div>
            </div>
        </div>
        `
        history.pushState({page_state: page_state},null, new_state);
        if(auth_info.access_level === 2){
            main_html.insertAdjacentHTML("beforeend",admin_panel_domstring);
            get_all_blog_reports();
            get_all_user_reports();
        }
    else if (new_state === "advancedsearch") {
        let advancedsearch = `
        <div class="flex-vertical align-center" id="advancedpagecontainer">
            <h3>Search Parameters</h3>
            <div id="advancedpagesection">
                <div class="advancedsearchtitle">
                    <div style="float:left;width: 10%">
                        Title
                    </div>
                    <div style="width: 90%">
                        <input type="text" class="advancedstringinput" placeholder="String" style="width: 80%; text-align: center">
                    </div>
                </div>
                <div class="advancedsearchtitle">
                    <div style="float: left;width:30%">
                    Date Created
                    </div>
                    <div style="float: right;width: 60%;">    
                        <input type="text" class="advancednuminput" placeholder="Min Int" style="text-align: center">
                        &nbsp
                        <input type="text" class="advancednuminput" placeholder="Max Int" style="text-align: center">
                    </div>
                </div>
                <div class="advancedsearchtitle">
                    <div style="width: 20%; float:left">
                        Category
                    </div>
                    <div style="width: 80%; float:right">
                        <input type="text" class="advancedstringinput" placeholder="(Select From Options)" style="width:70%;text-align: center" >
                    </div>
                    
                </div>
                <div class="advancedsearchtitle">
                    <div style="width: 10%; float:left">
                        Tags
                    </div>
                    <div  style="width:90%; float: right">
                        <input type="text" class="advancedstringinput" placeholder="(Select From Options)" style="text-align: center">
                        <button class="genericbtn" style="width:50%; float: right;">
                            Add new tag
                        </button>
                    </div>
                </div>
                <div class="advancedsearchtitle">
                    <div style="width: 30%; float:left; text-align: center">
                        Average Controversial Rating
                    </div>
                    <div style="float: right;width: 60%;"> 
                        <input type="text" class="advancednuminput" placeholder="Min Int" style="text-align: center">
                        &nbsp
                        <input type="text" class="advancednuminput" placeholder="Max Int" style="text-align: center">
                    </div>
                </div>
                <div class="advancedsearchtitle">
                    <div style="width: 30%; float:left; text-align: center">
                        Average Relevancy Rating
                    </div>
                    <div style="float: right;width: 60%;"> 
                        <input type="text" class="advancednuminput" placeholder="Min Int" style="text-align: center">
                        &nbsp
                        <input type="text" class="advancednuminput" placeholder="Max Int" style="text-align: center">
                    </div>
                    </div>
                <div class="advancedsearchtitle">
                    <div style="width: 30%; float:left; text-align: center">
                        Average Impression Rating
                    </div>
                    <div style="float: right;width: 60%;"> 
                        <input type="text" class="advancednuminput" placeholder="Min Int" style="text-align: center">
                        &nbsp
                        <input type="text" class="advancednuminput" placeholder="Max Int" style="text-align: center">
                    </div>
                </div>
                <div class="advancedsearchtitle">
                    <div style="width: 20%; float:left; text-align: center">
                        Creator's Username
                    </div>
                    <div style="width: 70%;float:right;padding-right:5%">
                        <input type="text" class="advancedstringinput" placeholder="(String)" style="width:100%; float:right; text-align: center">
                    </div>
                </div>
                <div class="advancedsearchtitle">
                    <button class="genericbtn">
                        Add parameter
                    </button>
                </div>
            </div>
            <button class="genericbtn" id="advancedsearchbtn">
                <b>Search</b>
            </button>
        </div>
        `
        history.pushState({ page_state: page_state }, null, "/advancedsearch");
        main_html.insertAdjacentHTML("beforeend", advancedsearch);
    }
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
    if(auth_info.access_level == 2){
        let admin_domstring = `
            <button class="nav-item-container nav-button flex-horizontal" role="navigation" tabindex="0" id="admin">

                <span class="material-icons">
                    admin_panel_settings
                </span>
                <span class="nav-heading">
                    Admin Panel
                </span>
            
            </button>
        `;
        nav_element.insertAdjacentHTML("beforeend", admin_domstring);
        $("#admin").onclick = () => {
            change_page_state("/admin");
        }
    }
    $("#home-btn").onclick = () => {
        change_page_state("/home");
    };
    $("#about-us-btn").onclick = () => {
        change_page_state("/aboutus");
    };
    $("#legal-btn").onclick = () => {
        change_page_state("/legalpage");
    };
    $("#advancedsearch").onclick = () => {
        change_page_state("/advancedsearch")
    }
    $("#search-bar").onsubmit = (ev) => {
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
        register_activity();
        main();
    });

});
// register("egorcik", "egorch.formal@gmail.com", "123qwe", "02/12/2001")
// register("julia", "jul.f@manchester.ac.uk", "polasdfsdfdsasfad14F141$$$", "2021-03-21")
// login("egorcik", "123qwe")
// login("jul.f@manchester.ac.uk", "polo157gfd$")
