// presentational counterpart to Login component

import React, { Component } from 'react';

class LoginForm extends Component {
   
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            message: "",
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        var data = {
            email: this.state.email,
            password: this.state.password
        };

        this.props.handleSubmit(data);
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
    }

    render() {
        return (
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
                        this.props.message &&
                        <p className="error-message">{this.props.message}</p>
                    }
                    <input type="submit" value="Login" className="login-button"/>
                </form>
            </div>
        );
    }

}

export default LoginForm;