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
            </div>
        )
    }
}

export default About;