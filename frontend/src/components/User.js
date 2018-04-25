import React, { Component } from 'react';
import './../css/User.css';

class User extends Component {

    constructor(props) {
        super(props)

        var user_id = this.props.location.pathname.split('/')[2];

        this.state = {
            user_id: user_id,
            user: null
        }
    }

    componentDidMount() {
        fetch('http://localhost:3001/user/' + this.state.user_id, {
            method: 'post',
            body: JSON.stringify({token: localStorage.getItem('kanboard-user-token')}),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with get user fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                this.setState({user: data.user});
            }
        });
    }

    render() {
        if (this.state.user) {
            return(
                <div className="container">
                    <h1 className="page-title">{this.state.user.user_name + "'s Profile"}</h1>
                    <hr className="title-underline" />

                    <div className="user-info">
                        <div className="user-item user-email">
                            <p>Email: <span>{this.state.user.user_email}</span></p>
                        </div>

                        <div className="user-item user-location">
                            <p>Location: <span>{this.state.user.user_location || "Not Given"}</span></p>
                        </div>

                        <div className="user-item user-company">
                            <p>Company: <span>{this.state.user.user_company || "Not Given"}</span></p>
                        </div>

                        <div className="user-item user-position">
                            <p>Position: <span>{this.state.user.user_position || "Not Given"}</span></p>
                        </div>

                        <div className="user-item user-bio">
                            <p>Bio: <span>{this.state.user.user_bio || "Not Given"}</span></p>
                        </div>
                    </div>
                </div>
            );
        }
        else {
            return(
                <div className="container">

                </div>
            );
        }
        
    }
}

export default User;