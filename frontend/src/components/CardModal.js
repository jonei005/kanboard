import React, { Component } from 'react';
import { connect } from 'react-redux';
import { deleteCard, updateCard } from './../actions';
import './../css/CardModal.css';

const RENAME = 'rename';
const DESCRIPTION = 'description';
const ADDCOMMENT = 'addcomment';
const DUEDATE = 'duedate';

class CardModal extends Component {

    constructor(props) {
        super(props);

        // bind function to component event listener can be added/removed 
        this.keyDown = this.keyDown.bind(this);

        this.state = {
            renameCardFormOpen: false,
            deleteCardFormOpen: false,
            editDescriptionFormOpen: false,
            commentFormOpen: false,
            dueDateFormOpen: false,
            renameCardFormInput: props.card.card_name,
            editDescriptionFormInput: props.card.card_description || '',
            commentFormInput: ''
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

    toggleRenameCardForm() {
        this.setState({renameCardFormOpen: !this.state.renameCardFormOpen});
    }

    renameCard() {
        var new_card_name = this.state.renameCardFormInput;

        if (new_card_name.length === 0) {
            this.setState({
                renameCardFormOpen: false,
                renameCardFormInput: this.props.card.card_name
            });
            return;
        }
        
        if (new_card_name === this.props.card.card_name) {
            this.setState({renameCardFormOpen: false});
            return;
        }

        fetch('http://localhost:3001/updatecard/rename/' + this.props.card.card_id, {
            method: 'post',
            body: JSON.stringify({
                token: localStorage.getItem('kanboard-user-token'),
                new_card_name: new_card_name
            }),
            headers: {'content-type': 'application/json'}
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with rename card fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                console.log(data.message);

                this.setState({renameCardFormOpen: false});

                // redux store stuff
                this.props.updateCard(this.props.card.card_id, {card_name: new_card_name}, RENAME);
            }            
        });
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

            // close card modal
            this.props.closeCardModal();

            // redux store stuff
            this.props.deleteCard(this.props.card.card_id);
        });
    }

    toggleEditDescriptionForm() {
        this.setState({
            editDescriptionFormOpen: !this.state.editDescriptionFormOpen,
            editDescriptionFormInput: this.props.card.card_description || ''
        });
    }

    editDescription() {
        var new_card_description = this.state.editDescriptionFormInput;

        if (new_card_description === this.props.card.card_description) {
            this.setState({editDescriptionFormOpen: false});
            return;
        }

        fetch('http://localhost:3001/updatecard/description/' + this.props.card.card_id, {
            method: 'post',
            body: JSON.stringify({
                token: localStorage.getItem('kanboard-user-token'),
                new_card_description: new_card_description
            }),
            headers: {'content-type': 'application/json'}
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with edit card description fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                console.log(data.message);

                // close edit description form
                this.setState({editDescriptionFormOpen: false});

                // update in redux
                this.props.updateCard(this.props.card.card_id, {card_description: new_card_description}, DESCRIPTION);

            }
        });
    }

    toggleCommentForm() {
        this.setState({
            commentFormOpen: !this.state.commentFormOpen, 
            commentFormInput: ''
        });
    }

    addComment() {

        if (this.state.commentFormInput === '') {
            this.setState({commentFormOpen: false});
            return;
        }
        
        var comment = this.state.commentFormInput;
        var user_id = this.props.user.user_id;
        var user_name = this.props.user.user_name;

        var commentObject = {comment, user_id, user_name};
        
        fetch('http://localhost:3001/updatecard/addcomment/' + this.props.card.card_id, {
            method: 'post',
            body: JSON.stringify({
                token: localStorage.getItem('kanboard-user-token'),
                new_comment: commentObject
            }),
            headers: {'content-type': 'application/json'}
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with add comment fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                console.log(data.message);

                this.setState({
                    commentFormOpen: false,
                    commentFormInput: ''
                });

                // update in redux
                this.props.updateCard(this.props.card.card_id, {card_comments: data.result.card_comments}, ADDCOMMENT);
            }
        });
    }

    toggleDueDateForm() {
        this.setState({dueDateFormOpen: !this.state.dueDateFormOpen});
    }

    setDueDate(e) {
        e.preventDefault();
        var dueDate = document.getElementById("due-date-input").value;

        // console.log(dueDate);

        var dateCheck = new Date(dueDate + ' 00:00');
        if (isNaN(dateCheck.getTime())) {
            console.log('Wrong date mate');
            return;
        }
        
        console.log(dateCheck.toDateString());

        fetch('http://localhost:3001/updatecard/duedate/' + this.props.card.card_id, {
            method: 'post',
            body: JSON.stringify({
                token: localStorage.getItem('kanboard-user-token'),
                due_date: dueDate
            }),
            headers: {'content-type': 'application/json'}
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with add due date fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                console.log(data.message);

                this.setState({dueDateFormOpen: false});

                // update in redux
                this.props.updateCard(this.props.card.card_id, {due_date: dateCheck}, DUEDATE);
            }
        });

        return;
    }

    handleChange = (e) => {
        this.setState({[e.target.id]: e.target.value});
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
            due = new Date(card.card_due).toDateString();
            //due = card.card_due;
        }

        // get card priority if there is one
        var priority = null;
        if (card.card_priority !== null) {
            priority = card.card_priority;
        }

        // get card description if there is one
        var description = null;
        if (card.card_description !== null && card.card_description.length > 0) {
            description = card.card_description;
        }
        
        // get card comments if there are any
        var comments = null;
        if (card.card_comments !== null && card.card_comments.length > 0) {
            comments = card.card_comments;

            // sort them in decreasing order (recent first) based on timestamp
            comments.sort((comment1, comment2) => {
                return comment2.timestamp - comment1.timestamp;
            })

            comments = comments.map((comment, index) => {
                var timestamp = new Date(comment.timestamp).toDateString();
                return (
                    <div className="card-modal-comment" key={index}>
                        <p className="card-modal-comment-name">{comment.user_name}</p>
                        <p className="card-modal-comment-timestamp">{timestamp}</p>
                        <p className="card-modal-comment-text">{comment.comment}</p>
                    </div>
                )
            });

        }

        return (
            <div className="card-modal-backdrop" onClick={() => this.props.closeCardModal()}>
                <div className="card-modal-container" onClick={(e) => e.stopPropagation()}>
                    <div className="card-modal-info">
                        <button onClick={() => this.props.closeCardModal()} className="card-modal-close-button" title="Close">
                            <i className="fas fa-times"></i>
                        </button>
                        <button className="card-modal-info-button" title="Info">
                            <i className="far fa-question-circle"></i>
                        </button>
                        {!this.state.renameCardFormOpen
                            ?
                            <h3 id="card-modal-name" onClick={() => this.toggleRenameCardForm()}>{card.card_name}</h3>
                            :
                            <div className="rename-card-form">
                                <input type="text" id="renameCardFormInput" autoFocus
                                    value={this.state.renameCardFormInput} 
                                    onChange={(e) => this.handleChange(e)}
                                    onKeyDown={(e) => {if (e.keyCode === 13) this.renameCard()}}
                                    onFocus={(e) => {e.target.select()}}
                                />
                                <button onClick={() => this.renameCard()}>
                                    <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        }
                        <div className="card-modal-columns">
                            <div className="card-modal-left">
                                <div className="card-modal-tags">
                                    <p className="card-modal-item"><i className="fas fa-tag"></i> Tags {tags || <span className="tag-none">None</span>}</p>
                                </div>
                                <div className="card-modal-due-date">
                                    <p className="card-modal-item"><i className="fas fa-clock"></i> Due Date {
                                        <span className="due-date-text" onClick={() => this.toggleDueDateForm()}>{due}</span> || <span className="tag-none">None</span>
                                        }
                                    </p>
                                    {this.state.dueDateFormOpen &&
                                        <form className="set-due-date-form" onSubmit={(e) => this.setDueDate(e)}>
                                            <span>Enter a due date: &nbsp;</span>
                                            <input type="date" id="due-date-input"/>
                                            <button type="submit" className="set-due-date-button" title="Set Due Date">
                                                <i className="fas fa-check"></i>
                                            </button>
                                            <button type="button" onClick={() => this.setState({dueDateFormOpen: false})} className="close-due-date-button" title="Cancel">
                                                <i className="fas fa-ban"></i>
                                            </button>
                                        </form>
                                    }
                                </div>
                                <div className="card-modal-priority">
                                    <p className="card-modal-item"><i className="fas fa-exclamation-circle"></i> Priority {priority || <span className="tag-none">None</span>}</p>
                                </div>
                                <div className="card-modal-description">
                                    <p className="card-modal-item small-margin">
                                        <i className="fas fa-clipboard-list"></i> Description 
                                        {this.state.editDescriptionFormOpen &&
                                            <button onClick={() => this.editDescription()}>Save <i className="fas fa-check"></i></button>
                                        }
                                    </p>
                                    {!this.state.editDescriptionFormOpen
                                        ?
                                        <p className="card-modal-description-text" onClick={() => this.toggleEditDescriptionForm()}>
                                            {description || "Click here to add a description."}
                                        </p>
                                        :
                                        <div className="edit-card-description-form">
                                            <textarea id="editDescriptionFormInput" autoFocus rows="8"
                                                value={this.state.editDescriptionFormInput}
                                                onChange={(e) => this.handleChange(e)}
                                                onKeyDown={(e) => {if (e.keyCode === 13 && e.shiftKey) this.editDescription()}}
                                            />
                                        </div>
                                    }
                                </div>
                                <div className="card-modal-comments">
                                    <p className="card-modal-item small-margin">
                                        <i className="fas fa-comment"></i> Comments 
                                        <button onClick={() => this.toggleCommentForm()} className="open-comment-form-button" title="Add Comment">
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </p>
                                    {this.state.commentFormOpen &&
                                        <div className="add-comment-form">
                                            <textarea id="commentFormInput" autoFocus rows="4"
                                                placeholder="Type your comment here"
                                                value={this.state.commentFormInput}
                                                onChange={(e) => this.handleChange(e)}
                                                onKeyDown={(e) => {if (e.keyCode === 13 && e.shiftKey) this.addComment()}}
                                            />
                                            <button onClick={() => this.addComment()} className="save-comment-button">Save Comment <i className="fas fa-check"></i></button>
                                            <button onClick={() => this.toggleCommentForm()} className="cancel-comment-button">Cancel <i className="fas fa-ban"></i></button>
                                        </div>
                                    }
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
                                    <button onClick={() => this.toggleDueDateForm()}>Change Due Date</button>
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

const mapDispatchToProps = (dispatch) => {
    return {
        deleteCard: (card_id) => dispatch(deleteCard(card_id)),
        updateCard: (card_id, data, update_type) => dispatch(updateCard(card_id, data, update_type))
    }
}

export default connect(null, mapDispatchToProps)(CardModal);