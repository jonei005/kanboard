import React, { Component } from 'react';

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
        return(
            <div>
                <p>User Page</p>
                <p>{this.state.user_id}</p>
            </div>
        );
    }
}

export default User;