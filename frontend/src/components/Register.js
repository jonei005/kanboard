import React, { Component } from 'react';
import './../css/Register.css';

class Register extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            confirmPassword: ""
        }
    }

    componentWillMount() {
        document.title = "Sign Up To Kanboard"

        // if user logged in, go to Landing
    }

    // for validating the form (check length, matching, etc)
    validate(email, password, confirm) {
        var emailEmpty = (email.length === 0);
        var passwordEmpty = (password.length === 0);
        var confirmEmpty = (confirm.length === 0);

        // TODO: Make these messages appear on page
    
        if (emailEmpty || passwordEmpty || confirmEmpty) {
            var message = "Please fill in the following fields: ";
            message += emailEmpty ? "Email, " : "";
            message += passwordEmpty ? "Password, " : "";
            message += confirmEmpty ? "Confirm Password, " : "";
            console.log(message);
            return 0;
        }

        if (password.length < 6) {
            console.log("Please use a longer password");
            return 0;
        }

        if (password !== confirm) {
            console.log("Passwords don't match.");
            return 0;
        }

        return 1;
    }

    // for handling the "Sign Up" button
    handleSubmit = (e) => {
        e.preventDefault();

        // form validation/sanitation
        var email = this.state.email;
        var password = this.state.password;
        var confirm = this.state.confirmPassword;

        if (!this.validate(email, password, confirm)) {
            return;
        }

        // make POST request
        var userData = {
            email: email,
            password: password,
            confirm: confirm
        };

        var data = JSON.stringify(userData);

        //console.log("User data is: ", data);

        fetch("http://localhost:3001/register", {
            method: "post",
            body: data,
            headers: {
                'access-control-allow-origin': '*',
                'content-type': 'application/json'
            }
        }).then(response => {
            console.log(response);
            if (response.status === 200) {
                alert("Success!");
            }
        })

    }

    // for handling changes to input fields
    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
    }

    render() {
        return(
            <div className="container">
                <h1 className="page-title">Sign Up To Kanboard</h1>
                <hr className="title-underline" />
                <form className="register-form" onSubmit={(e) => this.handleSubmit(e)}>
                    <p>Email:</p>
                    <input type="email" className="register-field" id="email"
                        value={this.state.email} onChange={this.handleChange} />
                    <p>Password:</p>
                    <input type="password" className="register-field" id="password"
                        value={this.state.password} onChange={this.handleChange} />
                    <p>Confirm Password:</p>
                    <input type="password" className="register-field" id="confirmPassword"
                        value={this.state.confirmPassword} onChange={this.handleChange} />
                    <input type="submit" value="Sign Up" className="register-button" id="register-button"/>
                </form>
            </div>
        )
    }
}

export default Register;