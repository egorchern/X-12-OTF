let preferences;
async function get_preferences() {
    return fetch("/api/recommendations/get_preferences", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },

    })
        .then((result) => result.json())
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

async function on_save_preferences() {
    // reverse look category ids
    preferences.category_ids = []
    let reversed_categories = objectFlip(categories_hashmap);
    
    document.querySelectorAll("#category-rankings .draggable .category-text").forEach((category, index) => {
        let category_id = reversed_categories[category.textContent]
        
        preferences.category_ids.push(category_id)
        
    })
    preferences.controversial_cutoff = $("#controversial-range").value;
    preferences.impression_cutoff = $("#impression-range").value;
    preferences.relevancy_cutoff = $("#relevancy-range").value;
    let temp = await edit_preferences(preferences)
    if (temp.code === 1) {
        location.reload()
    }
}

async function parse_preferences() {
    let temp = await get_preferences();
    if (temp.code != 1) { return null; }
    preferences = temp.data;

    if (preferences.ideal_word_count === undefined) { preferences.ideal_word_count = 200 }
    if (preferences.controversial_cutoff === undefined) { preferences.controversial_cutoff = 10 }
    if (preferences.impression_cutoff === undefined) { preferences.impression_cutoff = 10 }
    if (preferences.relevancy_cutoff === undefined) { preferences.relevancy_cutoff = 10 }
    if (preferences.category_ids === undefined || preferences.category_ids[0] == null) { preferences.category_ids = [] }
}

async function edit_preferences(preferences) {
    return fetch("/api/recommendations/edit_preferences", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
    })
        .then((result) => result.json())
        .then((result) => {
            return result
        });
}
parse_preferences();
// edit_preferences({
//     ideal_word_count: 165,
//     category_ids: [2, 3],
//     controversial_cutoff: 5,
//     relevancy_cutoff: 10,
//     impression_cutoff: 10
// })


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
                    <div>
                        <h5 style="text-align:center">Rating cut-offs</h5>
                        <h6>Blogs above controversial limit won't be shown. For other, blogs with ratings below specified value won't be shown</h6>
                        <div class="flex-horizontal align-center">
                            <div class="flex-vertical align-center cutoff-container">
                                <label for="customRange1" class="form-label">Controversial cut-off</label>
                                <div class="flex-horizontal align-center width-full">
                                    <input type="range" class="form-range" id="controversial-range" min="0" max="10" step="0.1">
                                    <strong style="margin-left: 0.1em; min-width: 50px; text-align: center"></strong>
                                </div>
                                
                            </div>
                            <div class="flex-vertical align-center cutoff-container">
                                <label for="customRange1" class="form-label">Impression cut-off</label>
                                <div class="flex-horizontal align-center width-full">
                                    <input type="range" class="form-range" id="impression-range" min="0" max="10" step="0.1">
                                    <strong style="margin-left: 0.1em; min-width: 50px; text-align: center"></strong>
                                </div>
                                
                            </div>
                            <div class="flex-vertical align-center cutoff-container">
                                <label for="customRange1" class="form-label">Relevancy cut-off</label>
                                <div class="flex-horizontal align-center width-full">
                                    <input type="range" class="form-range" id="relevancy-range" min="0" max="10" step="0.1">
                                    <strong style="margin-left: 0.1em; min-width: 50px; text-align: center"></strong>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" id="save-profile-preferences">Save Preferences</button>
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
                item.childNodes[2].onclick = removeItem
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

        function removeItem(event){
            let element = event.target.parentNode;
            element.remove();
            let newCategory = `
            <option value=${element.childNodes[0].textContent}>
            ${element.childNodes[0].textContent}
            </option>
            `
            $("#newCategory-select").insertAdjacentHTML("beforeend", newCategory)
        }

        function addNewItem(item = null) {
            let newItem;
            if (item === null) {
                newItem = $("#newCategory-select").value;
            }
            else {
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
                myspan.className = "category-text"
                myspan.textContent = newItem;
                li.appendChild(myspan);
                li.insertAdjacentHTML("beforeend", `
                <span class="material-icons delete-category-icon" style="color:#dc3545; text-align:end">
                delete
                </span>
                `)
                
                ul.appendChild(li);
                addEventsDragAndDrop(li);
                
                li.childNodes[2].onclick = removeItem
                document.querySelectorAll("#newCategory-select option").forEach((element, index) => {
                    if (element.value === newItem) {
                        element.remove();
                    }
                })

            }
        }

        $("#add-category-btn").onclick = () => { addNewItem() };


    }
    const initialize_cutoffs = () => {
        const rangeOnInput = (event) => {
            let target = event.target
            
            let element = target.parentNode.childNodes[3].textContent = target.value
            
        }
        let current = $("#controversial-range")
        current.value = preferences.controversial_cutoff
        current.parentNode.childNodes[3].textContent = current.value
        current.oninput = rangeOnInput
        current = $("#impression-range")
        current.value = preferences.impression_cutoff
        current.parentNode.childNodes[3].textContent = current.value
        current.oninput = rangeOnInput
        current = $("#relevancy-range")
        current.value = preferences.relevancy_cutoff
        current.parentNode.childNodes[3].textContent = current.value
        current.oninput = rangeOnInput
        
    }
    let temp = $("#preferences-modal")
    if (temp != undefined){
        temp.remove();
    }
    $("body").insertAdjacentHTML("beforeend", preferences_modal_domstring)
    let myModal = new bootstrap.Modal($("#preferences-modal"), {})
    myModal.show();
    initialize_word_counts();
    initialize_categories();
    initialize_cutoffs();
    $("#save-profile-preferences").onclick = () => {
        myModal.hide()
        on_save_preferences()
    };

}