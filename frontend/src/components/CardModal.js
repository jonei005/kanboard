import React, { Component } from 'react';
//import { connect } from 'react-redux';
//import { deleteCard } from './../actions';
import './../css/CardModal.css';

class CardModal extends Component {

    constructor(props) {
        super(props);

        // bind function to component event listener can be added/removed 
        this.keyDown = this.keyDown.bind(this);

        this.state = {
            deleteCardFormOpen: false
        }
    }

    keyDown(e) {
        // close modal if ESC key is pressed
        e.stopPropagation();
        if (e.keyCode === 27) {
            this.props.closeCardModal();
        }
    }

    componentWillMount() {
        document.addEventListener('keydown', this.keyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.keyDown);
    }

    toggleDeleteCardForm() {
        this.setState({deleteCardFormOpen: !this.state.deleteCardFormOpen});
    }

    deleteCard() {

        // delete card from DB via api call, then delete in redux store
        fetch('http://localhost:3001/deletecard/' + this.props.card.card_id, {
            method: 'post',
            body: JSON.stringify({token: localStorage.getItem('kanboard-user-token')}),
            headers: {'content-type': 'application/json'}
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with delete card fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                console.log(data.message);
            }

            // redux store stuff

            // close card modal
            this.props.closeCardModal();
        });
    }

    toggleRenameCardForm() {
        //
        return;
    }

    toggleEditDescriptionForm() {
        //
        return;
    }
    

    render() {
        // get card data from props, this holds all card data
        var card = this.props.card;

        // get card tags if there are any
        var tags = null;
        if (card.card_tags !== null) {
            tags = card.card_tags.map((tag, index) => {
                return(
                    <span className={"tag-"+tag}>{tag}</span> 
                )
            });
        }

        // get card due date if there is one
        var due = null;
        if (card.card_due !== null) {
            due = card.card_due;
        }

        // get card priority if there is one
        var priority = null;
        if (card.card_priority !== null) {
            priority = card.card_priority;
        }

        // get card description if there is one
        var description = null;
        if (card.card_description !== null) {
            description = card.card_description;
        }
        
        // get card comments if there are any
        var comments = null;
        if (card.card_comments !== null && card.card_comments.length > 0) {
            comments = card.card_comments.map((comment, index) => {
                return (
                    <p className="card-modal-comment">{comment}</p>
                )
            })
        }
        

        return (
            <div className="card-modal-backdrop" onClick={() => this.props.closeCardModal()}>
                <div className="card-modal-container" onClick={(e) => e.stopPropagation()}>
                    <div className="card-modal-info">
                        <h3 id="card-modal-name">{card.card_name}</h3>
                        <div className="card-modal-columns">
                            <div className="card-modal-left">
                                <div className="card-modal-tags">
                                    <p className="card-modal-item"><i className="fas fa-tag"></i> Tags {tags || <span className="tag-none">None</span>}</p>
                                </div>
                                <div className="card-modal-due-date">
                                    <p className="card-modal-item"><i className="fas fa-clock"></i> Due Date {due || <span className="tag-none">None</span>}</p>
                                </div>
                                <div className="card-modal-priority">
                                    <p className="card-modal-item"><i className="fas fa-exclamation-circle"></i> Priority {priority || <span className="tag-none">None</span>}</p>
                                </div>
                                <div className="card-modal-description">
                                    <p className="card-modal-item small-margin"><i className="fas fa-clipboard-list"></i> Description</p>
                                    <p className="card-modal-description-text">
                                        {description || "Click here to add a description."}
                                    </p>
                                </div>
                                <div className="card-modal-comments">
                                    <p className="card-modal-item small-margin"><i className="fas fa-comment"></i> Comments</p>
                                    {comments || <p>No comments here</p>}
                                </div>
                            </div>
                            <div className="card-modal-right">
                                <div className="card-modal-assignees">
                                    <p className="card-modal-item small-margin"><i className="fas fa-user-circle"></i> Assignees</p>
                                </div>
                                <div className="card-modal-options-buttons">
                                    <p className="card-modal-item small-margin"><i className="fas fa-cog"></i> Options</p>
                                    <button>Add Assignees</button>
                                    <button>Add Tags</button>
                                    <button>Change Due Date</button>
                                    <button>Set Priority</button>
                                    <button onClick={() => this.toggleEditDescriptionForm()}>Edit Description</button>
                                    <button onClick={() => this.toggleRenameCardForm()}>Rename Card</button>
                                    {!this.state.deleteCardFormOpen
                                        ?
                                        <button onClick={() => this.toggleDeleteCardForm()} className="delete-card-button">Delete Card</button>
                                        :
                                        <div className="delete-card-form">
                                            <p>Are you sure you want to delete this card?</p>
                                            <button onClick={() => this.deleteCard()} className="delete-card-button">Confirm Delete</button>
                                            <button onClick={() => this.toggleDeleteCardForm()}>Cancel</button>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default CardModal;