import React, { Component } from 'react';
import api from './../constants/api.js';
import './../css/User.css';

class Account extends Component {

    constructor(props) {
        super(props);

        this.state = {
            user: null,
            locationFormOpen: false,
            locationFormInput: '',
            companyFormOpen: false,
            companyFormInput: '',
            positionFormOpen: false,
            positionFormInput: '',
            bioFormOpen: false,
            bioFormInput: ''
        }
    }

    componentDidMount() {
        // fetch user info 
        fetch(api + '/account', {
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
                console.log('Hmm something went wrong with get account fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                this.setState({
                    user: data.user,
                    locationFormInput: data.user.user_location || '',
                    companyFormInput: data.user_company || '',
                    positionFormInput: data.user_position || '',
                    bioFormInput: data.user_bio || ''
                });
            }
        });
    }

    submitLocationForm() {
        var new_location = this.state.locationFormInput;

        if (new_location === this.state.user.user_location || (new_location === '' && this.state.user.user_location === null)) {
            this.toggleForm('location');
            return;
        }

        fetch(api + '/updateaccount/location', {
            method: 'post',
            body: JSON.stringify({
                token: localStorage.getItem('kanboard-user-token'),
                data: new_location
            }),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with update location fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                var new_user = Object.assign({}, this.state.user);
                new_user.user_location = new_location;
                this.setState({user: new_user}, this.toggleForm('location'));
            }
            else {
                this.toggleForm('location');
            }
        });
    }

    submitCompanyForm() {
        var new_company = this.state.companyFormInput;

        if (new_company === this.state.user.user_company || (new_company === '' && this.state.user.user_company === null)) {
            this.toggleForm('company');
            return;
        }

        fetch(api + '/updateaccount/company', {
            method: 'post',
            body: JSON.stringify({
                token: localStorage.getItem('kanboard-user-token'),
                data: new_company
            }),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with update company fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                var new_user = Object.assign({}, this.state.user);
                new_user.user_company = new_company;
                this.setState({user: new_user}, this.toggleForm('company'));
            }
            else {
                this.toggleForm('company');
            }
        });
    }

    submitPositionForm() {
        var new_position = this.state.positionFormInput;

        if (new_position === this.state.user.user_position || (new_position === '' && this.state.user.user_position === null)) {
            this.toggleForm('position');
            return;
        }

        fetch(api + '/updateaccount/position', {
            method: 'post',
            body: JSON.stringify({
                token: localStorage.getItem('kanboard-user-token'),
                data: new_position
            }),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with update position fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                var new_user = Object.assign({}, this.state.user);
                new_user.user_position = new_position;
                this.setState({user: new_user}, this.toggleForm('position'));
            }
            else {
                this.toggleForm('position');
            }
        });
    }

    submitBioForm() {
        var new_bio = this.state.bioFormInput;

        if (new_bio === this.state.user.user_bio || (new_bio === '' && this.state.user.user_bio === null)) {
            this.toggleForm('bio');
            return;
        }

        fetch(api + '/updateaccount/bio', {
            method: 'post',
            body: JSON.stringify({
                token: localStorage.getItem('kanboard-user-token'),
                data: new_bio
            }),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with update bio fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                var new_user = Object.assign({}, this.state.user);
                new_user.user_bio = new_bio;
                this.setState({user: new_user}, this.toggleForm('bio'));
            }
            else {
                this.toggleForm('bio');
            }
        });
    }

    toggleForm(formName) {
        // opens & closes forms based on their name
        var form = formName + 'FormOpen';
        var input = formName + 'FormInput';
        var stateInput = 'user_' + formName;
        this.setState({
            [form]: !this.state[form],
            [input]: this.state.user[stateInput] || ''
        });
    }

    handleChange = (e) => {
        this.setState({[e.target.id]: e.target.value});
    }

    render() {
        var user = this.state.user;

        if (user) {
            var bioClass = !user.user_bio ? "empty" : "";

            return (
                <div className="container account">
                    <h1 className="page-title">Your Profile</h1>
                    <hr className="title-underline" />
                    <p className="edit-account-note">Note: Click on your information to edit it.</p>

                    <div className="user-info">
                        <div className="user-item user-email">
                            <p><i className="fas fa-envelope fa-lg"></i> Email: <span>{user.user_email}</span></p>
                        </div>

                        <div className="user-item user-location">
                            {this.state.locationFormOpen
                                ?
                                <div className="account-location-form">
                                    <p><i className="fas fa-compass fa-lg"></i> Location: </p>
                                    <input type="text" name="Location" id="locationFormInput" autoFocus
                                        value={this.state.locationFormInput}
                                        onChange={(e) => this.handleChange(e)}
                                        onFocus={(e) => {e.target.select()}}
                                        onKeyDown={(e) => {if (e.keyCode === 13) this.submitLocationForm()}}
                                    />
                                    <button onClick={() => this.submitLocationForm()} className="save-button">Save <i className="fas fa-check"></i></button>
                                    <button onClick={() => this.toggleForm('location')} className="cancel-button">Cancel <i className="fas fa-ban"></i></button>
                                </div>
                                :
                                <p><i className="fas fa-compass fa-lg"></i> Location: 
                                    <span onClick={() => this.toggleForm('location')}> {user.user_location || "Not Given"}</span>
                                </p>
                            }  
                        </div>

                        <div className="user-item user-company">
                            {this.state.companyFormOpen
                                ?
                                <div className="account-company-form">
                                    <p><i className="fas fa-building fa-lg"></i> Company: </p>
                                    <input type="text" name="Company" id="companyFormInput" autoFocus
                                        value={this.state.companyFormInput}
                                        onChange={(e) => this.handleChange(e)}
                                        onFocus={(e) => {e.target.select()}}
                                        onKeyDown={(e) => {if (e.keyCode === 13) this.submitCompanyForm()}}
                                    />
                                    <button onClick={() => this.submitCompanyForm()} className="save-button">Save <i className="fas fa-check"></i></button>
                                    <button onClick={() => this.toggleForm('company')} className="cancel-button">Cancel <i className="fas fa-ban"></i></button>
                                </div>
                                :
                                <p><i className="fas fa-building fa-lg"></i> Company: 
                                    <span onClick={() => this.toggleForm('company')}> {user.user_company || "Not Given"}</span>
                                </p>
                            }  
                        </div>

                        <div className="user-item user-position">
                            {this.state.positionFormOpen
                                ?
                                <div className="account-position-form">
                                    <p><i className="fas fa-people-carry fa-lg"></i> Position: </p>
                                    <input type="text" name="Position" id="positionFormInput" autoFocus
                                        value={this.state.positionFormInput}
                                        onChange={(e) => this.handleChange(e)}
                                        onFocus={(e) => {e.target.select()}}
                                        onKeyDown={(e) => {if (e.keyCode === 13) this.submitPositionForm()}}
                                    />
                                    <button onClick={() => this.submitPositionForm()} className="save-button">Save <i className="fas fa-check"></i></button>
                                    <button onClick={() => this.toggleForm('position')} className="cancel-button">Cancel <i className="fas fa-ban"></i></button>
                                </div>
                                :
                                <p><i className="fas fa-people-carry fa-lg"></i> Position: 
                                    <span onClick={() => this.toggleForm('position')}> {user.user_position || "Not Given"}</span>
                                </p>
                            }
                        </div>

                        <div className="user-item user-bio">
                            {this.state.bioFormOpen
                                ?
                                <div className="account-bio-form">
                                    <p><i className="fas fa-user-circle fa-lg"></i> Bio: </p>
                                    <textarea name="Bio" id="bioFormInput" autoFocus rows="8"
                                        placeholder="Your bio"
                                        value={this.state.bioFormInput}
                                        onChange={(e) => this.handleChange(e)}
                                        onKeyDown={(e) => {if (e.keyCode === 13 && e.ctrlKey) this.submitBioForm()}}
                                    />
                                    <button onClick={() => this.submitBioForm()} className="save-button">Save <i className="fas fa-check"></i></button>
                                    <button onClick={() => this.toggleForm('bio')} className="cancel-button">Cancel <i className="fas fa-ban"></i></button>
                                </div>
                                :
                                <p><i className="fas fa-user-circle fa-lg"></i> Bio: 
                                    <span onClick={() => this.toggleForm('bio')} className={bioClass}> {user.user_bio || "Not Given"}</span>
                                </p>
                            }
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

export default Account;