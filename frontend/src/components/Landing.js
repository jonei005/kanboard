import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './../css/Landing.css';
import './../css/App.css';

class Landing extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loggedIn: false
        }
    }

    componentWillMount() {
        document.title = "Kanboard"
    }

    componentDidMount() {
        var userToken = localStorage.getItem('kanboard-user-token');

        this.setState({
            loggedIn: userToken ? true : false
        });
    }

    render() {
        return(
            <div id="kanboard">
                <div id="kanboard-header">
                    <div id="kanboard-header-overlay">
                        <div className="container">
                            <h1 className="page-title">Kanboard</h1>
                            {/* <hr className="title-underline" /> */}
                            <p className="kanboard-header-description">
                                Kanboard is a way to share kanban boards with your team. 
                                You can create boards for your personal use, or share 
                                your board with team members for a collaborative effort. 
                                Get started with Kanboard now, and watch your productivity soar!
                            </p>
                            {this.state.loggedIn
                                ?
                                <div className="landing-buttons">
                                    <Link to="/dashboard">Go To Dashboard</Link>
                                    <Link to="/account">View Your Account</Link>
                                </div>
                                :
                                <div className="landing-buttons">
                                    <Link to="/register">Create Account</Link>
                                    <Link to="/login">Login</Link>
                                </div>
                            }
                        </div>
                    </div>
                </div>
               
                <div className="container">
                    <h2 className="kanboard-section-title">Explore Kanboard's Features</h2>
                    <div className="kanboard-sticky-notes">
                        <div className="kanboard-sticky-note sticky-note-1">
                            <h3>Share</h3>
                            Share your board with teammates to keep track of an important project,
                            or use a private board to keep track of day to day activities.
                        </div>
                        <div className="kanboard-sticky-note sticky-note-2">
                            <h3>Manage</h3>
                            Create columns to represent stages of development (backlog, in progress, etc).
                            Use cards to manage tasks and user stories.
                        </div>
                        <div className="kanboard-sticky-note sticky-note-3">
                            <h3>Keep Track</h3>
                            Drag and drop cards between columns to visualize ongoing progress during the project.
                            Watch your project go from start to finish! 
                        </div>
                    </div>

                    <h2 className="kanboard-section-title">Get Started</h2>
                    <p>
                        To get started, follow the links above. Simply create an account and we will set you up with
                        your first board! You can rename your board or create a brand new board for yourself. Click
                        on the board to open it up, then you can add columns and cards as you see fit! There are also
                        lots of customization options for cards, so you can keep descriptions, priorities, tags, due
                        dates, and more saved in each card. Kanboard helps keep you productive and moving forward.
                    </p>
                </div>

                <div className="footer">
                    <div className="container">
                        <p className="footer-text">
                            Created by Jeremy O'Neill
                        </p>
                        <p className="footer-links">
                            <a href="https://github.com/jonei005/kanboard">Project Repo</a>
                            &nbsp;|&nbsp;
                            <a href="https://github.com/jonei005/">Github</a>
                            &nbsp;|&nbsp;
                            <a href="https://www.linkedin.com/in/jeremy-oneill/">LinkedIn</a>
                        </p>
                    </div>
                </div>
                
                
            </div>
        )
    }
}

export default Landing;