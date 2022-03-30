function display_feedback() {
	alert("Test");
	feedback_domstring = `
	<div id="feedback-alert-box" class="flex-vertical align-center">
                        
        </div>
        <form class='feedback-form flex-vertical align-center animate__animated animate__fadeIn needs-validation' novalidate>
            <div >
                <label for='bug-or-general' class='form-label'>Thank you for taking the time to give us feedback. Please tell us whether your feedback is based on a bug you have discovered or general feedback.</label>
                <input type='text' class="form-control" id='bug-or-general' >
                <div class="invalid-feedback" id="bug-or-general-invalid-feedback">
                    placeholder
                </div>
            </div>
            <div >
                <div >
                    <label for='feedback-text' class='form-label'>Please give a description.</label>
                </div>
                <input type='text' class="form-control" id='feedback-text'>
                <div class="invalid-feedback" id="feedback-text-invalid-feedback">
                    placeholder
                </div>
            </div>
            <button type="submit" class="btn btn-outline-primary form-btn" id="send-feedback-btn" >Submit feedback</button>
        </form>
	`
	
	main_html.insertAdjacentHTML("beforeend", feedback_domstring);
            $(".feedback-form").onsubmit = (feedbackEv) => 
            {
                feedbackEv.preventDefault();
                alert("Feedback Successful");
            };
	return true;
}