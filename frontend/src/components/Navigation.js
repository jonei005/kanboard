import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './../css/Navigation.css';

class Navigation extends Component {
    render() {
        return(
            <div id="navigation">
                <div className="nav-button btn-1">
                    <Link to="/">Kanboard</Link>
                </div>
                <div className="nav-button btn-2">
                    <Link to="/login">Login</Link
                ></div>
                <div className="nav-button btn-3">
                    <Link to="/register">Register</Link>
                </div>
                <div className="nav-button btn-4">
                    <Link to="/about">About</Link>
                </div>
            </div>
        )
    }
}

export default Navigation;