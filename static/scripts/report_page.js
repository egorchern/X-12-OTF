let reporting_catergories = ["Promoting violence","Hateful speech"]

const valid_element = (identifier, cls) => {
    let element = $(identifier);
    element.classList.remove("is-valid");
    element.classList.remove("is-invalid");
    element.classList.add(cls);
}

//puts all the html elements onto the page
async function show_report_page(blog_id){
    //html stuff for displaying the catergories for the drop down menu
    let report_category_options_dom_string = ``
    reporting_catergories.forEach((category, index) => {
        report_category_options_dom_string += `
        <option value=${index}>${category}</option>
        `
    })
    //html stuff here
    let report_domstring = `
    <div class="modal fade" id="bigReport" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Report Form</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>We take harmful content reports very seriously. 
                    Your report will be manually reviewed by an administrator.
                    Please provide as much information as possible to make it easier to make our judgement. 
                        <br>
                    
                        
                        
                    </p>
                
                    <h4>Please select why do you think this blog is harmful:</h4>
                    <select class="form-select" id="report-category">
                        ${report_category_options_dom_string}
                    </select>
                    <h4 style="margin-top:0.8rem;"> Please provide more details (such as a specific sentence that you find harmful):</h4>
                    <textarea id="edit-report-body" class="form-control" style="min-height:300px"></textarea>
                    <div class="invalid-feedback" id="invalid-details">
                        placeholder
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary">Submit report</button>
                </div>
            </div>
        </div>
    </div>
    `
    let body = $("body");
    body.insertAdjacentHTML("beforeend",report_domstring);
    var myModal = new bootstrap.Modal($("#bigReport"), {})
    myModal.show();
    const submitBtn = document.querySelector(".modal-footer button");
    submitBtn.onclick = async function (){
        let identifier_class = $("#edit-report-body").value != "" ? "is-valid" : "is-invalid";
        if (identifier_class === "is-invalid"){
            $("#invalid-details").innerHTML = "Please give some details";
            valid_element("#edit-report-body", identifier_class);
            return null
        }
        $(".modal-body").insertAdjacentHTML('beforeend', spinner_domstring);
        let hcaptcha_widget = hcaptcha.render($("body"), {
            size: "invisible",
            sitekey: "28dd5d54-e402-445c-ac00-541d3e9cadc3"
        })
        let hcaptcha_result = await hcaptcha.execute(hcaptcha_widget, {
            async: true
        })
        $(".lds-roller").remove();
        let temp = await submit_report(blog_id, myModal, hcaptcha_result.response)
    };
}

async function submit_report(blog_id, myModal, hcaptcha_response){
    
    
    let report_data = {
        blog_id: blog_id,
        report_reason: reporting_catergories[$("#report-category").selectedIndex],
        report_body: $("#edit-report-body").value,
        hcaptcha_response: hcaptcha_response
    }
    $("#edit-report-body").value = "";
    valid_element("#edit-report-body", null);
    myModal.hide();
    return fetch("/api/blog/report",{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(report_data)
    }).then((result) => result.json())
    .then((result) => {
        return result
    })

    
}

async function submit_user_report(user_id, myModal, hcaptcha_response){
    
        let report_data = {
            user_id: user_id,
            report_reason: reporting_catergories[$("#report-category").selectedIndex],
            report_body: $("#edit-report-body").value,
            hcaptcha_response: hcaptcha_response
        }
        $("#edit-report-body").value = "";
        valid_element("#edit-report-body", null);
        myModal.hide();
        return fetch("/api/user/report",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(report_data)
        }).then((result) => result.json())
        .then((result) => {
            return result
        })

    
}


let user_reporting_catergories = ["Numerous hateful blogs", "Inappropriate description", "Inappropriate profile picture"]

async function show_user_report_page(user_id){
    //html stuff for displaying the catergories for the drop down menu
    let user_report_category_options_dom_string = ``
    user_reporting_catergories.forEach((category, index) => {
        user_report_category_options_dom_string += `
        <option value=${index}>${category}</option>
        `
    })
    //html stuff here
    let report_domstring = `
    <div class="modal fade" id="big_user_Report" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Report Form</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>We take harmful content reports very seriously. 
                    Your report will be manually reviewed by an administrator.
                    Please provide as much information as possible to make it easier to make our judgement. 
                        <br>
                    
                        
                        
                    </p>
                
                    <h4>Please select why do you think this user is harmful:</h4>
                    <select class="form-select" id="report-category">
                        ${user_report_category_options_dom_string}
                    </select>
                    <h4>Please provide more details (what specifically about the user in harmful):</h4>
                    <textarea id="edit-report-body" class="form-control" style="min-height:300px"></textarea>
                    <div class="invalid-feedback" id="invalid-details">
                        placeholder
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary">Submit report</button>
                </div>
            </div>
        </div>
    </div>
    `
    let body = $("body");
    body.insertAdjacentHTML("beforeend",report_domstring);
    var myModal = new bootstrap.Modal($("#big_user_Report"), {})
    myModal.show();
    const submitBtn = document.querySelector(".modal-footer button");
    submitBtn.onclick = async function (){
        let identifier_class = $("#edit-report-body").value != "" ? "is-valid" : "is-invalid";
        if (identifier_class === "is-invalid"){
            $("#invalid-details").innerHTML = "Please give some details";
            valid_element("#edit-report-body", identifier_class);
            return null;
        }
        $(".modal-body").insertAdjacentHTML('beforeend', spinner_domstring);
        let hcaptcha_widget = hcaptcha.render($("body"), {
            size: "invisible",
            sitekey: "28dd5d54-e402-445c-ac00-541d3e9cadc3"
        })
        let hcaptcha_result = await hcaptcha.execute(hcaptcha_widget, {
            async: true
        })
        $(".lds-roller").remove();
        let temp = await submit_user_report(user_id, myModal, hcaptcha_result.response)
    }
}