import React, { Component } from 'react';

class About extends Component {

    componentWillMount() {
        document.title = "About Kanboard"
    }

    render() {
        return(
            <div className="container">
                <h1 className="page-title">About Kanboard</h1>
                <hr className="title-underline" />
                <h3>What Is Kanboard?</h3>
                <p>
                    Kanboard is a collaborative Kanban board designed to help your team make progress and meet deadlines. 
                    Keep separate Kanban boards for each of your projects and share them with your teammates.
                    Drag and drop cards between columns to allow for easy task completion and visual progress.
                </p>
                <h3>How Was Kanboard Made?</h3>
                <p>Kanboard is fully written in JavaScript ES6 as a way to gain experience in using a full JavaScript stack.</p>
                <p><b>Frontend</b></p>
                <p>The Kanboard frontend was written in <span>React.js</span> to allow for a highly interactive user experience. The initial setup was done using Create React App.</p>
                <p>Using the <span>Redux</span> library allowed for global state, which prevented the need for passing data down through multiple components.</p>
                <p>The <span>React Drag and Drop</span> library added even more interactivity by allowing users to seamlessly drag and drop cards between columns when progress is made.</p>
                <p><b>Backend</b></p>
                <p>The Kanboard backend is an API built using <span>Node.js</span> with the <span>Express.js</span> framework.</p>
                <p>This API stores user data in a PostgreSQL database. User passwords are hashed and salted using Bcrypt to protect user data.</p>
                <p>User sessions are saved in the browser using JSON Webtokens, so the user session persists between website visits until manually logging out</p>
            </div>
        )
    }
}

export default About;