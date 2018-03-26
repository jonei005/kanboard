import React, { Component } from 'react';
import './../css/Login.css';

class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            message: ""
        }
    }

    componentWillMount() {
        document.title = "Login to Kanboard"

        // if user logged in, go to Landing
    }

    validate(email, password) {
        var emailEmpty = (email.length === 0);
        var passwordEmpty = (password.length === 0);

        if (emailEmpty || passwordEmpty) {
            return 0;
        }

        // any other checks?

        return 1;
    }

    handleSubmit(e) {
        e.preventDefault();
        var data = {
            email: this.state.email,
            password: this.state.password
        }

        // form validation/sanitation
        if (!this.validate(data.email, data.password)) {
            alert("Please complete all fields.");
        }

        // make POST request
        fetch("http://localhost:3001/login", {
            method: "post",
            body: JSON.stringify(data),
            headers: {
                "content-type": "application/json"
            }
        }).then((response) => {
            if (response.status === 200 || response.status === 401 || response.status === 500) {
                return (response.json());
            }
            else {
                console.log("Unrecognized code: ", response.status);
                return ({
                    
                });
            }    
        }).then((data) => {
            if (data && data.success === true) {
                console.log(data);
                // redirect?
            }
            else if (data && data.success === false) {
                this.setState({message: data.message});
            }
            else {
                console.log("Something went wrong with the log in...");
            }
        });
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
    }

    render() {
        return(
            <div className="container">
                <h1 className="page-title">Login To Kanboard</h1>
                <hr className="title-underline" />
                <form className="login-form" onSubmit={(e) => this.handleSubmit(e)}>
                    <p>Email:</p>
                    <input type="email" className="login-field" id="email"
                        value={this.state.email} onChange={this.handleChange}/>
                    <p>Password:</p>
                    <input type="password" className="login-field" id="password" 
                        value={this.state.password} onChange={this.handleChange}/>
                    { /* If message exists (not empty), display the message to user */
                        this.state.message &&
                        <p className="error-message">{this.state.message}</p>
                    }
                    <input type="submit" value="Login" className="login-button"/>
                </form>
            </div>
        )
    }
}

export default Login;