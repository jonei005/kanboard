import React, { Component } from 'react';
import './../css/Login.css';

class Login extends Component {

    componentWillMount() {
        document.title = "Login to Kanboard"

        // if user logged in, go to Landing
    }

    handleSubmit(e) {
        e.preventDefault();
        alert("Logging in!");

        // form validation/sanitation

        // make POST request
    }

    render() {
        return(
            <div className="container">
                <h1 className="page-title">Login To Kanboard</h1>
                <hr className="title-underline" />
                <form className="login-form" onSubmit={(e) => this.handleSubmit(e)}>
                    <p>Email:</p>
                    <input type="email" className="login-field"/>
                    <p>Password:</p>
                    <input type="password" className="login-field"/>
                    <input type="submit" value="Login" className="login-button"/>
                </form>
            </div>
        )
    }
}

export default Login;