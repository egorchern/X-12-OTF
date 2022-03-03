// const storage_analytics = localStorage;
const storage_cookie = localStorage;
const analytics_permission = "analytics_accepted_value";
const cookie_permission = "cookie_accepted_value";
//window.localStorage.clear();
const shouldShowPopup = () => storage_cookie.getItem(cookie_permission) != "Yes";
const popupBoxSmall = document.querySelector(".popup-box-small");
const popupBoxBig = document.querySelector(".popup-box-big");
const closeBtnBig = document.querySelector(".close-btn-big");
const customBtnBig = document.querySelector(".option-small");



let initialcookiehtml = `
<section>
    <div class="popup-box-small animate__animated animate__zoomIn">
        <span class="material-icons fas fa-times close-btn-small">
        close
        </span>
        <div class="nav-logo-container flex-horizontal">
            <img src="/images/logo.webp" alt="OpenThoughtFloor logo">
        </div>
        <h2>Your privacy</h2>
        <p>By clicking "Accept all cookies", you agree OTF can store
            cookies on your device and disclose information in accordance
            with our Cookie Policy.
            <i class="	fas fa-external-link-alt"></i>
        </p>
        <button class="accept-btn-small">Accept all cookies</button>
        <button class="option-small" id="expand">Customise</button>
    </div>
</section>
`
var cookiehtml = `
<div class="popup-screen-big">
<div class="popup-box-big animate__animated animate__zoomIn">
<span class="material-icons fas fa-times close-btn-big">
close
</span>
    <h2>Our use of cookies</h2>
    <p>We use necessary cookies to make our site work.
        We'd also like to set optional analytics cookies
        to help us improve it. We won't set optional cookies
        unless you enable them. Using this tool will set a cookie on
        your device to remember your preferences.
        <br>
        For more detailed information about the cookies we use, see our Cookies page
        <span class="material-icons link">
        open_in_new
        </span>
    </p>
    <h3>Necessary cookies</h3>
    <p>Necessary cookies enable more functionality such as security, network management, and accessibility.
        You may disable these by changing your browser settings, but this may affect how the website functions.</p>
    <h3>Analytics cookies<label class="switch-big" ><input type="checkbox" id="check">
        <span class="slider round"></span></label></h3>
    <p>We'd set Google Analytics cookies to help us to improve our website
        by collecting and reporting information on how you use it. For more information on how these cookies
        work please see our 'Cookies page'. The cookies collect information in an anonymous form.
    </p>
    <button class="btn-big">Save and close</button>
</div>
</div>
`

let isinitialdisplayed = true;
function switchcookie() {
    var body = document.getElementById("main")
    let temp = $(".popup-box-small")
    if (temp != null){
        temp.remove();
    }

    if (isinitialdisplayed) {
        body.insertAdjacentHTML("beforeBegin", initialcookiehtml);
        //accept all button
        const acceptallBtn = document.querySelector(".accept-btn-small");
        acceptallBtn.addEventListener("click", () => {
            storage_cookie.setItem(cookie_permission, "Yes");
            storage_cookie.setItem(analytics_permission, "Yes");
            $(".popup-box-small").remove();
        });
        
        const closeBtnSmall = document.querySelector(".close-btn-small");
        closeBtnSmall.onclick = () => {
            $(".popup-box-small").remove();
        }
        let btn = document.getElementById("expand")
        btn.onclick = switchcookie
    }
    else {
        body.insertAdjacentHTML("beforeend", cookiehtml);
        const popupScreenSmall = document.querySelector(".popup-screen-small");
        //save button
        const saveBtn = document.querySelector(".btn-big");
        storage_cookie.setItem(analytics_permission, "No");
        saveBtn.addEventListener("click", () => {
            popupScreenBig.classList.remove("active");
            storage_cookie.setItem(cookie_permission, "Yes");
            if (document.getElementById("check").checked == true) {
                //document.cookie = "Analytics Cookies = OpenThoughtFloor; max-age=" + 30 * 24 * 60 * 60; //1 month
                storage_cookie.setItem(analytics_permission, "Yes");
            }
        });
        const popupScreenBig = document.querySelector(".popup-screen-big");
        popupScreenBig.classList.add("active");
        // setTimeout(() => {
        //     popupScreenBig.classList.add("active");
        // }, 2000)
        //close button
        const closeBtnBig = document.querySelector(".close-btn-big");
        closeBtnBig.addEventListener("click", () => {
            popupScreenBig.classList.remove("active");

        })
    }
    isinitialdisplayed = !isinitialdisplayed;
}
// //open window
// if (shouldShowPopup()) {
//     switchcookie();
// }

