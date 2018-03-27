import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './../css/Navigation.css';

class Navigation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            auth: false
        }
    }

    logout() {
        localStorage.removeItem('kanboard-user-token');
        
        this.setState({
            auth: false
        });
    }

    render() {
        return(
            <div id="navigation">
                <div id="navigation-left">
                    <Link to="/" className="nav-button" id="nav-title">Kanboard</Link>
                    <Link to="/login" className="nav-button">Login</Link>
                    <Link to="/register" className="nav-button">Register</Link>
                    <Link to="/about" className="nav-button">About</Link>
                </div>
                <div id="navigation-right">
                    <Link to="/about" className="nav-button">Account</Link>
                    <Link to="/" className="nav-button" onClick={this.logout}>Logout</Link>
                </div>
            </div>
        )
    }
}

// const AuthNav = () => (
//     <div id="navigation">
//         <div id="navigation-left">
//             <Link to="/" className="nav-button" id="nav-title">Kanboard</Link>
//             <Link to="/login" className="nav-button">Login</Link>
//             <Link to="/register" className="nav-button">Register</Link>
//             <Link to="/about" className="nav-button">About</Link>
//         </div>
//         <div id="navigation-right">
//             <Link to="/about" className="nav-button">Account</Link>
//             <Link to="/" className="nav-button" onClick={this.logout}>Logout</Link>
//         </div>
//     </div>
// )

// const NoAuthNav = () => (
//     <div id="navigation">
//         <div id="navigation-left">
//             <Link to="/" className="nav-button" id="nav-title">Kanboard</Link>
//             <Link to="/login" className="nav-button">Login</Link>
//             <Link to="/register" className="nav-button">Register</Link>
//             <Link to="/about" className="nav-button">About</Link>
//         </div>
//         <div id="navigation-right">
//             <Link to="/about" className="nav-button">Account</Link>
//             <Link to="/" className="nav-button" onClick={this.logout}>Logout</Link>
//         </div>
//     </div>
// )

export default Navigation;