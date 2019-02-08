import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from './../constants/api';

class ShareBoardModal extends Component {

    constructor(props) {
        super(props);

        // bind function to component event listener can be added/removed 
        this.keyDown = this.keyDown.bind(this);

        this.state = {
            shareModalFormInput: '',
            board_owner: null,
            board_members: null,
            errorMessage: null
        }
    }

    componentWillMount() {
        document.addEventListener('keydown', this.keyDown);
    }

    componentDidMount() {
        // get owner and members of the board
        fetch(api + '/boardmembers/' + this.props.id, {
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
                console.log('Hmm something went wrong with get members fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                console.log(data.message);

                this.setState({
                    board_members: data.board_members,
                    board_owner: data.board_owner
                });
            }
        });
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.keyDown);
    }

    keyDown(e) {
        // close modal if ESC key is pressed
        e.stopPropagation();
        if (e.keyCode === 27) {
            this.props.toggleShareModal();
        }
    }

    handleChange = (e) => {
        this.setState({[e.target.id]: e.target.value});
    }

    addBoardMember() {
        
        var newMember = this.state.shareModalFormInput;

        if (newMember === '') {
            this.setState({errorMessage: 'Please input an email address'})
            return;
        }
        

        // if user is already a member, do nothing
        for (var i = 0; i < this.state.board_members.length; i++) {
            if (this.state.board_members[i].user_email === newMember) {
                this.setState({errorMessage: 'User is already a member.', shareModalFormInput: ''});
                return;
            }
        }

        this.setState({shareModalFormInput: ''});

        fetch(api + '/addmember/' + this.props.id, {
            method: 'post',
            body: JSON.stringify({
                token: localStorage.getItem('kanboard-user-token'),
                user_email: newMember
            }),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with add member fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                if (data.success) {
                    console.log(data.user);
                    var board_members = [];
                    board_members = board_members.concat(this.state.board_members);
                    board_members.push(data.user);
                    this.setState({
                        board_members: board_members,
                        errorMessage: null
                    });
                }
                else {
                    console.log(data.message);
                    var errorMessage = "Error: " + data.message;
                    this.setState({errorMessage: errorMessage});
                }
            }
        });
    }

    render() {

        var owner = this.state.board_owner || null;
        var board_members = this.state.board_members || null;
        var members = [];

        if (board_members) {
            // sort and map board members to div elements
            board_members = board_members.sort((member1, member2) => {
                return member1.user_name.toLowerCase() > member2.user_name.toLowerCase();
            });

            members = board_members.map((member, index) => {
                return (
                    <Link to={"/user/" + member.user_id} key={index} className="board-member">
                        {member.user_name}
                    </Link>
                );
            });
        }

        return(
            <div className="share-modal-backdrop" onClick={() => this.props.toggleShareModal()}>
                <div className="share-modal-container" onClick={(e) => e.stopPropagation()}>
                    <div className="share-modal">
                        <button onClick={() => this.props.toggleShareModal()} className="share-modal-close-button" title="Close">
                            <i className="fas fa-times"></i>
                        </button>
                        <h3 className="share-modal-name">{"Share Board: " + this.props.name}</h3>
                        <div className="share-modal-form">
                            <p>Add a member to the board by submitting their email address below.</p>
                            <input type="text" id="shareModalFormInput" autoFocus placeholder="Email address"
                                value={this.state.shareModalFormInput}
                                onChange={(e) => this.handleChange(e)}
                                onKeyDown={(e) => {if (e.keyCode === 13) this.addBoardMember()}} 
                            />
                            <button onClick={() => this.addBoardMember()} className="share-modal-form-button">Share <i className="fas fa-check"></i></button>
                            {this.state.errorMessage && <p className="share-modal-form-error">{this.state.errorMessage}</p>}
                        </div>
                        <div className="share-modal-board-owner">
                            <p className="share-modal-board-owner-title"><i className="fas fa-user-circle fa-lg"></i>  Board Owner</p>
                            {owner && 
                                <Link to={"/user/" + owner.user_id} className="board-member .board-owner">
                                    {owner.user_name}
                                </Link>
                            }
                        </div>
                        <div className="share-modal-board-members">
                            <p className="share-modal-board-members-title"><i className="fas fa-users fa-lg"></i> Board Members</p>
                            {members}
                        </div>
                        <button onClick={() => this.props.toggleShareModal()} className="share-modal-done-button" title="Done">Done</button>
                    </div>
                </div>
            </div>            
        );
    }
}

export default ShareBoardModal;