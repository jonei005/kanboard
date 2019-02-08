import React, { Component } from 'react';
import LoginForm from './LoginForm';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { storeUser } from './../actions';
import api from './../constants/api';
import './../css/Login.css';

class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            message: "",
            auth: false
        }

        // this.validate = this.validate.bind(this);
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

        return 1;
    }

    handleSubmit(data) {
        // form validation/sanitation
        if (!this.validate(data.email, data.password)) {
            alert("Please complete all fields.");
        }

        // make POST request
        fetch(api + '/login', {
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
                return (null);
            }    
        }).then((data) => {
            if (data && data.success === true) {
                // data.user holds all user information
                // we need to call redux action to store this data
                console.log(data);
                this.props.storeUser(data.user);

                // store JWT in browser local storage
                localStorage.setItem('kanboard-user-token', data.token);
                this.setState({auth: true});

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
        if (this.state.auth === true) {
            return (
                <Redirect to="/dashboard" />
            );
        }

        else {
            return (
                <LoginForm handleSubmit={(data) => this.handleSubmit(data)} message={this.state.message} />
            );
        }
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        storeUser: (user) => dispatch(storeUser(user))
    }
}

export default connect(null, mapDispatchToProps)(Login);