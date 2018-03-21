import React, { Component } from 'react';
import './../css/Landing.css';
import './../css/App.css';

class Landing extends Component {

    componentWillMount() {
        document.title = "Kanboard"
    }

    render() {
        return(
            <div id="kanboard" className="container">
                <h1 className="page-title">Kanboard</h1>
                <hr className="title-underline" />
                <p className="kanboard-description">
                    Hello, I am Kanboard! I allow your team to share Kanban boards
                    in order to give you total control over your team progress! You 
                    can create private boards for your personal use, or share your
                    board with your team members for a collaborative effort. 
                </p>
                <p className="kanboard-description">
                    Create new columns on your board to represent the stages of
                    development, such as "backlog" and "complete". Each column can
                    hold "cards", which represent a feature or user story. Your cards
                    can contain a full description and a due date for the task. You
                    can assign your team members to any card, and when a card is 
                    progressing, you can click and drag it to the next column. 
                </p>
                <p className="kanboard-description">
                    Watch your project go from start to finish!
                </p>
            </div>
        )
    }
}

export default Landing;