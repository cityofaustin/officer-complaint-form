import React from "react";
import PropTypes from "prop-types";

import ProgressButton from "us-forms-system/lib/js/components/ProgressButton";
import SegmentedProgressBar from "us-forms-system/lib/js/components/SegmentedProgressBar";

class Confirmation extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            formSubmissionState: 0,
            userEmail: "",
            errorMessage: "",
            formData: JSON.parse(localStorage.getItem("opo_form_data")),
            submitUrl: localStorage.getItem("opo_form_submiturl"),
            confirmationCaseNumber: (localStorage.getItem("opo_confirmation_case_number") || "N/A")
        };
    }

    // Returns true if the email address looks normal...
    validateEmail (email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    // Submits the form
    resubmitForm() {
        console.log("resubmitForm() We are going to output your data here: ");
        console.log(this.state);
        let formData = this.state.formData;

        // Let's validate the email address, or show an error message ...
        if(this.validateEmail(this.state.userEmail) == false || this.state.userEmail == "") {
            console.log("We have a problem with the email: " + this.state.userEmail);
            this.setState({
                errorMessage: "Please provide a valid email address."
            });
        } else {
            // Let's change the form data prior to submission ...
            let old_email = formData["view:contactPreferences"].yourEmail;
            formData["view:contactPreferences"].yourEmail = this.state.userEmail;
            let new_email = formData["view:contactPreferences"].yourEmail;
            console.log("OldE: " + old_email);
            console.log("NewW: " + new_email);

            // Append two needed fields for the backend...
            formData.userConfirmationOnly = true;
            formData.confirmationCaseNumber = this.state.confirmationCaseNumber;

            // Let's move forward...
            this.setState({
                formData: formData
            });

            // Run the loading (three dots) animation...
            this.runLoaderAnimation();

            // setTimeout(this.markDone, 1000, this);

            // Make the XHR request with the formData and send to the submitUrl endpoint
            this.make_xhr_request(formData, this.state.submitUrl, this);
        }
    }

    // Triggers the three dots animation by changing the state
    runLoaderAnimation() {
        this.setState({
            formSubmissionState: 1
        });
    }

    // Triggers the checkmark animation by changing the state
    markDone(context) {
        context.setState({
            formSubmissionState: 2
        });
    }

    // Hides the error message
    hideErrorMessage() {
        this.setState({
            errorMessage: ""
        })
    }

    // Instantiates an XHR request, then submits to submitUrl
    make_xhr_request(formData, submitUrl, formContext = null) {
        console.log("API_URL: " + submitUrl);
        console.log("Appending formConfig to formData!");
        console.log(formData);

        // Create the XHR request
        var request = new XMLHttpRequest();
        // Return it as a Promise
        return new Promise(function (resolve, reject) {
                // Setup our listener to process complete requests
                request.onreadystatechange = function () {
                // Only run if the request is complete
                if (request.readyState !== 4) return;
                    // Process the response
                if (request.status >= 200 && request.status < 300) {
                    // If successful
                    resolve(request);
                } else {
                    // If failed
                    reject({
                               status: request.status,
                               statusText: request.statusText
                           });
                    }
                };

                // Setup our HTTP request, headers & send our payload ...
                request.open('POST', submitUrl, true);
                request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

                request.send(JSON.stringify(formData));
            })
            .then(function (response) {
                formContext.markDone(formContext);
                console.log("Success: ");
                console.log(response.response);
                let respObj = JSON.parse(response.response);
                console.log(respObj.case_number);
                localStorage.setItem("opo_confirmation_case_number", respObj.case_number);
                return response;
            })
            .catch(function (error) {
                console.log("Error: ");
                console.log(error);
                // return error;
            });
    }

    // Renders the right button based on the state formSubmissionState
    // 0 = Submit (regular)
    // 1 = Loading (three dots animation)
    // 2 = Done (animated checkmark, green button)
    renderButton() {
        switch(this.state.formSubmissionState) {
            case 1:
                return <button className="confirmation-button" onClick={() => this.resubmitForm()}>
                    <div className="confirmation-button--loading-btn"></div>
                </button>;
            case 2:
                return <button className="confirmation-button confirmation-button__success" onClick={null}>
                    <div className="confirmation-button--checkmark-container">
                        <div className="confirmation-button--checkmark draw">&nbsp;</div>
                    </div>
                </button>;
            default:
                return <button className="confirmation-button" onClick={() => this.resubmitForm()}>Submit</button>;
        }
    }

    render() {
        let confirmationCaseNumber = this.state.confirmationCaseNumber;

        let buttonContent = this.renderButton();

        return (
          <div className="schemaform-intro">
            <SegmentedProgressBar total={2} current={2}/>
            <h2 style={{textAlign: "center"}}>We have received your complaint</h2>
            <h3 style={{color: "#164ED2", textAlign: "center"}}>Your case number: {confirmationCaseNumber}</h3>
            <div className="confirmation">
                <hr/>
                <p style={{fontSize: "1.4rem"}}>For a copy of your complaint and confirmation number, enter your email address below.</p>
                <input className="confimation-input" type="email" disabled = {(this.state.formSubmissionState > 0) ? "disabled" : ""} value={this.state.userEmail} onChange={(event) => this.setState({userEmail: event.target.value})} />
                {buttonContent}
                <div className="confirmation-errorbox" style={(this.state.errorMessage.length === 0) ? {display: "none"} : {display: "block"}}>{this.state.errorMessage} (<a href="javascript:;" onClick={() => this.hideErrorMessage()}>dismiss</a>)</div>
            </div>
            <hr/>
            <p style={{fontSize: "1.4rem"}}>Our job is to make sure your complaint is investigated fairly and thoroughly. Thank you for sharing your experience with us. This helps us better serve you and your community.</p>
            <hr/>
            <p style={{fontSize: "1.4rem"}}>You will receive an email with a copy of your complaint and a confirmation number. You can email us at <a>policeoversight@austintexas.gov</a> or call us at <a>512-972-2676</a> with your confirmation number to find where your complaint is in this process.</p>
            <p style={{fontSize: "1.4rem"}}>If you provided your contact information, a staff person from the Office of Police Oversight will contact you within two to four business days.</p>
            <hr/>
            <p style={{fontSize: "1.4rem"}}><a href="http://alpha.austin.gov/police-oversight/complaint-investigation-process">What happens next</a></p>
          </div>
        );
  }
}

Confirmation.propTypes = {
  route: PropTypes.object,
  router: PropTypes.object
};

export default Confirmation;
