let profile_edit_state = false;
let profile_info = {};
let blogs_increment = 2;
let currently_showing = 0;
// This indicates what is the biggest avatar num. This is until we manage to make image uploads
let max_avatar_number = 10;
let currently_selected_avatar = 0;
async function get_public_profile_info(username) {
    return fetch(`/api/profile/${username}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    }).then((result) => result.json())
        .then((result) => {
            return result
        });
}

function objectFlip(obj) {
    const ret = {};
    Object.keys(obj).forEach(key => {
        ret[obj[key]] = key;
    });
    return ret;
}

function on_edit_avatar_click(avatar_id) {
    if (avatar_id === currently_selected_avatar || avatar_id > max_avatar_number) {
        return null;
    }
    currently_selected_avatar = avatar_id;
    document.querySelectorAll(".profile_edit_avatar").forEach((node, index) => {

        node.classList.remove("selected", "not_selected")
        if (index + 1 === currently_selected_avatar) {
            node.classList.add("selected")
        }
        else {
            node.classList.add("not_selected")
        }
    })
}

async function submit_profile_edit() {
    let personal_description = $("#profile-description-text").value;
    profile_info.personal_description = personal_description;
    profile_info.avatar_image_id = currently_selected_avatar;
    return fetch(`/api/edit/profile/${profile_info.username}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(profile_info)
    }).then((result) => result.json())
        .then((result) => {
            return result.code

        });
}

function get_edit_avatar_domstring() {
    let images = `

    `
    for (let i = 1; i <= max_avatar_number; i++) {
        images += `
       
        <img class="profile_edit_avatar ${profile_info.avatar_image_id === i ? "selected" : "not_selected"}" src="/images/avatar_${i}.webp" alt="avatar number ${i}" onclick="on_edit_avatar_click(${i})"/>
        
        
        `
    }
    let domstring = `
    <div class="flex-horizontal flex-wrap align-center">
        
        ${images}
    </div>
    `
    return domstring
}

async function toggle_edit_state() {
    profile_edit_state = !profile_edit_state;
    if (profile_edit_state) {
        let edit_btn = delete_dom_children("#edit-btn")
        let edit_btn_domstring = `
            <span class="material-icons">
            save
            </span>
            Save
        `;
        edit_btn.insertAdjacentHTML("beforeend", edit_btn_domstring);
        let description_element = $("#profile-description-text");
        description_element.remove();
        let description_domstring = `
        <textarea class="profile-description-box form-control" id="profile-description-text">
        </textarea>
        `;
        let profile_avatar_container = delete_dom_children("#profile-avatar-container");
        profile_avatar_container.insertAdjacentHTML("beforeend", get_edit_avatar_domstring());
        $("#personal-description-container").insertAdjacentHTML("beforeend", description_domstring);
        $("#profile-description-text").value = profile_info.personal_description;
    }
    else {
        let code = await submit_profile_edit();
        if (code === 1) {
            location.reload();
        }
        let edit_btn = delete_dom_children("#edit-btn")
        let edit_btn_domstring = `
            <span class="material-icons">
                edit
            </span>
            Edit
        `;
        edit_btn.insertAdjacentHTML("beforeend", edit_btn_domstring);
        let description_element = $("#profile-description-text");
        description_element.remove();
        let description_domstring = DOMPurify.sanitize(`
        <div id="profile-description-text" class="profile-description-box">
            ${profile_info.personal_description}
        </div>
        `)
        $("#personal-description-container").insertAdjacentHTML("beforeend", description_domstring);
    }
}

let preferences_modal_domstring = `
    <div class="modal fade" id="preferences-modal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="exampleModalLabel">Preferences</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="flex-vertical align-center">
                    <h4 style="text-align:center">Accessibility</h4>
                    <div class="width-full" style="margin-top:1em">
                        <h5 style="text-align:center">Font-size</h5>
                    </div>
                    <h4 style="margin-top:2em" style="text-align:center">Content</h4>
                    <div style="margin-top:1em">
                        <h5 style="text-align:center">Ideal word count</h5>
                        <div class="flex-horizontal flex-wrap align-center">
                            <div class="ideal-word-count-item">
                                Short (200)
                            </div>
                            <div class="ideal-word-count-item">
                                Medium (450)
                            </div>
                            <div class="ideal-word-count-item">
                                Long (800)
                            </div>
                            <div class="flex-vertical align-center ideal-word-count-item" style="z-index:15151">
                                <span>Or put a custom word count</span>
                                <input type="text" class="form-control" id="custom-word-count" min="0">
                            </div>
                        </div>
                    </div>
                    <div style="position:relative">
                        <h5 style="text-align:center">Preffered categories</h5>
                        <h6 style="text-align:center">The first category is the most preffered</h6>
                        <div class="flex-horizontal align-center" style="margin-bottom: 2em; ">
                            <select class="form-select" id="newCategory-select" style="height: 50px; max-width: 250px;">
                            </select>
                            <span class="material-icons" style="color: #6bb86a" id="add-category-btn">
                            add_circle
                            </span>
                        </div>
                        <ul id="category-rankings">
                            
                            
                        </ul>
                    
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" id="save-profile-preferences" data-bs-dismiss="modal">Save Preferences</button>
            </div>
            </div>
        </div>
    </div>
    `


async function toggle_preferences_modal() {
    let word_count_hashmap = {
        200: 0,
        450: 1,
        800: 2
    }
    const on_word_count_click = (index) => {
        if (index != 3) {
            preferences.ideal_word_count = Number(Object.keys(word_count_hashmap)[index])
            $("#custom-word-count").value = "";
        }
        else {
            preferences.ideal_word_count = 0
        }

        initialize_word_counts()
    }
    const initialize_word_counts = () => {
        let ideal_word_count = preferences.ideal_word_count;
        let word_items = document.querySelectorAll(".ideal-word-count-item")
        $("#custom-word-count").oninput = function () {

            preferences.ideal_word_count = Number(this.value);
        }
        word_items.forEach((element, index) => {
            element.onclick = () => {
                on_word_count_click(index)
            }
            element.classList.remove("selected")
            element.classList.add("not-selected")
        })
        let selected_index = word_count_hashmap[ideal_word_count]
        if (selected_index != undefined) {
            word_items[selected_index].classList.remove("not-selected")
            word_items[selected_index].classList.add("selected")
        }
        else {
            word_items[word_items.length - 1].classList.remove("not-selected")
            word_items[word_items.length - 1].classList.add("selected")
            $("#custom-word-count").value = ideal_word_count
        }

    }
    const initialize_categories = () => {
        let category_options_dom_string = ``
        categories.forEach((category, index) => {
            category_options_dom_string += `
            <option value=${category}>${category}</option>
            `
        })
        $("#newCategory-select").insertAdjacentHTML("beforeend", category_options_dom_string)
        preferences.category_ids.forEach((item, index) => {
            addNewItem(categories_hashmap[item])
        })
        var btn = document.querySelector('.add');
        var remove = document.querySelector('.draggable');

        function dragStart(e) {
            this.style.opacity = '0.4';
            dragSrcEl = this;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
        };

        function dragEnter(e) {
            this.classList.add('over');
        }

        function dragLeave(e) {
            e.stopPropagation();
            this.classList.remove('over');
        }

        function dragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            return false;
        }

        function dragDrop(e) {
            if (dragSrcEl != this) {
                dragSrcEl.innerHTML = this.innerHTML;
                this.innerHTML = e.dataTransfer.getData('text/html');
            }
            return false;
        }

        function dragEnd(e) {
            var listItens = document.querySelectorAll('.draggable');
            [].forEach.call(listItens, function (item) {
                item.classList.remove('over');
            });
            this.style.opacity = '1';
        }

        function addEventsDragAndDrop(el) {
            el.addEventListener('dragstart', dragStart, false);
            el.addEventListener('dragenter', dragEnter, false);
            el.addEventListener('dragover', dragOver, false);
            el.addEventListener('dragleave', dragLeave, false);
            el.addEventListener('drop', dragDrop, false);
            el.addEventListener('dragend', dragEnd, false);
        }

        var listItens = document.querySelectorAll('.draggable');
        [].forEach.call(listItens, function (item) {
            addEventsDragAndDrop(item);
        });
        
        function addNewItem(item = null) {
            let newItem;
            if (item === null){
                newItem = $("#newCategory-select").value;
            }
            else{
                newItem = item
            }
            console.log(newItem, item);
            if (newItem != '') {
                var li = document.createElement('li');
                var attr = document.createAttribute('draggable');
                var ul = document.querySelector('ul');
                li.className = 'draggable flex-horizontal align-center';
                
                attr.value = 'true';
                li.setAttributeNode(attr);
                let myspan = document.createElement("span")
                myspan.style.flexGrow = "1";
                myspan.style.textAlign = "start";
                myspan.textContent = newItem;
                li.appendChild(myspan);
                li.insertAdjacentHTML("beforeend", `
                <span class="material-icons" style="color:#dc3545; text-align:end">
                delete
                </span>
                `)
                
                ul.appendChild(li);
                addEventsDragAndDrop(li);
                document.querySelectorAll("#newCategory-select option").forEach((element, index) => {
                    if(element.value === newItem){
                        element.remove();
                    }
                })

            }
        }

        $("#add-category-btn").onclick = () => {addNewItem()};


    }
    let myModal = new bootstrap.Modal($("#preferences-modal"), {})
    myModal.show();
    initialize_word_counts();
    initialize_categories();
    $("#save-profile-preferences").onclick = () => { 
        on_save_preferences()
    };

}

async function ban() {
    return fetch(`/api/profile/${profile_info.username}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(profile_info)
    }).then((result) => result.json())
        .then((result) => {
            return result.code

        });
}

async function fetch_and_render_next_blog_tiles(blog_ids) {
    if (currently_showing >= blog_ids.length) {
        $("#blogs-shown").innerHTML = `${currently_showing}/${blog_ids.length}`;
        return null;
    }
    let temp = await get_certain_blog_tiles_data(blog_ids.slice(currently_showing, currently_showing + blogs_increment));
    if (temp.code != 1) {
        return null
    }
    let blog_tiles = temp.data;
    console.log(blog_tiles)
    let authored_blogs_container = $("#authored-blogs-container");
    blog_tiles.forEach((blog_tile_data, index) => {
        insert_blog_tile(blog_tile_data, "#authored-blogs-container")
    })
    currently_showing = Math.min(currently_showing + blogs_increment, blog_ids.length);
    $("#blogs-shown").innerHTML = `${currently_showing}/${blog_ids.length}`;
    // If all of the authored blogs are shown, then we should remove the "show more" blogs button.
    temp = $("#authored-blogs-show-more-btn")
    if (temp != null && currently_showing == blog_ids.length) {
        temp.remove();
    }
}

function initialize_show_more_blogs_btn(blog_ids) {
    if (currently_showing < blog_ids.length) {
        let show_more_domstring = `
        <button class="btn btn-outline-primary flex-horizontal align-center" id="authored-blogs-show-more-btn">
            <span class="material-icons">
                arrow_circle_down
            </span>

            Show more
        </button>
        `;
        $("#authored-blogs-container").insertAdjacentHTML("beforeend", show_more_domstring);

        $("#authored-blogs-show-more-btn").onclick = () => { fetch_and_render_next_blog_tiles(blog_ids); }
    }
}

async function insert_profile_info() {
    $("body").insertAdjacentHTML("beforeend", preferences_modal_domstring)
    let profile_control_container = $("#profile-control-container");
    // This means that the user is on their own profile, so should add edit button
    if (auth_info.username === profile_info.username) {
        let logout_button_domstring = `
        <button class="btn btn-outline-danger profile-control-button flex-horizontal align-center" id="logout-btn" type="button" tabindex="0">
            <span class="material-icons">
                logout
            </span>
            Log out
        </button>
        `;
        profile_control_container.insertAdjacentHTML("beforeend", logout_button_domstring);
        $("#logout-btn").onclick = logout;
        let edit_button_domstring = `
        <button id="edit-btn" class="btn btn-outline-primary profile-control-button flex-horizontal align-center">
            <span class="material-icons">
                edit
            </span>
            Edit
        </button>
        `;
        profile_control_container.insertAdjacentHTML("beforeend", edit_button_domstring);
        $('#edit-btn').onclick = toggle_edit_state;
        let preferences_button_domstring = `
        <button id="preferences-btn" class="btn btn-outline-primary profile-control-button flex-horizontal align-center">
            <span class="material-icons">
            online_prediction
            </span>
            Preferences
        </button>
        `
        profile_control_container.insertAdjacentHTML("beforeend", preferences_button_domstring);
        $('#preferences-btn').onclick = toggle_preferences_modal
    }
    else {
        if (auth_info.access_level === 1) {
            let report_button_domstring = `
            <button class="btn btn-outline-danger profile-control-button flex-horizontal align-center">
                <span class="material-icons">
                    gavel
                </span>
                Report
            </button>
            `;
            profile_control_container.insertAdjacentHTML("beforeend", report_button_domstring);
        } else if (auth_info.access_level === 2) {
            let ban_button_domstring = `
            <button class="btn btn-outline-danger profile-control-button flex-horizontal align-center" id="ban-btn" type="button" tabindex="0">
                <span class="material-icons">
                    delete
                </span>
                Ban
            </button>
            `;
            profile_control_container.insertAdjacentHTML("beforeend", ban_button_domstring);
            $('#ban-btn').onclick = ban;
        }
    }
    // Profile text field initialization
    $("#username-text").textContent = `Username: ${profile_info.username}`
    $("#date-created").textContent = `Date created: ${profile_info.date_created}`
    $("#date-last-accessed").textContent = `Date last accessed: ${profile_info.date_last_accessed}`
    $("#avatar-img").setAttribute("src", `/images/avatar_${profile_info.avatar_image_id}.webp`);
    $("#profile-description-text").textContent = profile_info.personal_description;
    fetch_and_render_next_blog_tiles(profile_info.authored_blogs);
    initialize_show_more_blogs_btn(profile_info.authored_blogs)

}


async function profile_main(username) {
    let profile_temp = await get_public_profile_info(username);
    profile_info = profile_temp.data;
    console.log(profile_info);
    currently_showing = 0;

    // This happens when the requested account exists
    if (profile_temp.code === 1) {
        profile_info.username = username;
        insert_profile_info(profile_info);
    }
    // This happens when the requested account does not exist
    else {
        let main = delete_dom_children("main");
        main.insertAdjacentHTML("beforeend", `<h2 style="text-align: center;">No account with username: ${username}, exists.</h2>`);
    }
    currently_selected_avatar = profile_info.avatar_image_id;

}