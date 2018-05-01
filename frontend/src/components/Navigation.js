import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { clearUser } from './../actions';
import './../css/Navigation.css';

class Navigation extends Component {

    constructor(props) {
        super(props);

        this.logout = this.logout.bind(this);
    }

    logout() {
        localStorage.removeItem('kanboard-user-token');
        this.props.clearUser();
    }

    render() {
        var {auth} = this.props;

        return auth ? <AuthNav logout={this.logout} /> : <NoAuthNav />
    }
}

class AuthNav extends Component {

    logout() {
        this.props.logout();
    }

    render() {
        return (
            <div id="navigation">
                <div id="navigation-left">
                    <Link to="/" className="nav-button" id="nav-title">Kanboard</Link>
                    <Link to="/dashboard" className="nav-button">Dashboard</Link>
                    <Link to="/about" className="nav-button">About</Link>
                </div>
                <div id="navigation-right">
                    <Link to="/account" className="nav-button">Account</Link>
                    <Link to="/" className="nav-button" onClick={() => this.logout()}>Logout</Link>
                </div>
            </div>
        )
    }
} 

const NoAuthNav = () => (
    <div id="navigation">
        <div id="navigation-left">
            <Link to="/" className="nav-button" id="nav-title">Kanboard</Link>

            <Link to="/about" className="nav-button">About</Link>
        </div>
        <div id="navigation-right">
            <Link to="/login" className="nav-button">Login</Link>
            <Link to="/register" className="nav-button">Register</Link>
        </div>
    </div>
)

const mapDispatchToProps = (dispatch) => {
    return {
        clearUser: () => dispatch(clearUser())
    }
}

export default connect(null, mapDispatchToProps)(Navigation);