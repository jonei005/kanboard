import React, { Component } from 'react';
import './../css/Register.css';

class Register extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            name: "",
            password: "",
            confirmPassword: ""
        }
    }

    componentWillMount() {
        document.title = "Sign Up To Kanboard"

        // if user logged in, go to Landing
    }

    // for validating the form (check length, matching, etc)
    validate(email, name, password, confirm) {
        var emailEmpty = (email.length === 0);
        var nameEmpty = (name.length === 0);
        var passwordEmpty = (password.length === 0);
        var confirmEmpty = (confirm.length === 0);

        // TODO: Make these messages appear on page
    
        if (emailEmpty || nameEmpty || passwordEmpty || confirmEmpty) {
            var message = "Please fill in the following fields: ";
            message += emailEmpty ? "Email, " : "";
            message += nameEmpty ? "Name, " : "";
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
        var name = this.state.name;
        var password = this.state.password;
        var confirm = this.state.confirmPassword;

        if (!this.validate(email, name, password, confirm)) {
            return;
        }

        // make POST request
        var userData = {
            email: email,
            name: name,
            password: password,
            confirm: confirm
        };

        var data = JSON.stringify(userData);

        fetch("http://localhost:3001/register", {
            method: "post",
            body: data,
            headers: {
                'access-control-allow-origin': '*',
                'content-type': 'application/json'
            }
        }).then(response => {
            if (response.status !== 200) {
                alert("Registration Failed");
            }
            return response.json();

        }).then(data => {
            console.log(data.message);
            console.log(data.user);

            var loginData = new URLSearchParams();
            loginData.append('email', userData.email);
            loginData.append('password', userData.password);

            // then login user *** WORK IN PROGRESS
            // fetch("http://localhost:3001/login", {
            //     method: "post",
            //     body: loginData,
            //     headers: {
            //         'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            //     }
            // }).then((response) => {
            //     if (response.status === 401) {
            //         alert("Logging in failed according to passport");
            //         return null;
            //     }
            //     else if (response.status !== 200) {
            //         alert("Log in failed");
            //         return null;
            //     }
            //     else {
            //         alert("Log in succeeded! I think!");
            //         return response.json();
            //     }
            // }).then((data) => {
            //     if (data) {
            //         console.log(data.message);
            //         // redirect user to home page or profile page
            //     }
            // });
        });

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
                    <p>Name:</p>
                    <input type="text" className="register-field" id="name"
                        value={this.state.name} onChange={this.handleChange} />
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