import React, { Component } from 'react';
import { connect } from 'react-redux';
import { deleteCard, updateCard } from './../actions';
import './../css/CardModal.css';

const RENAME = 'rename';
const DESCRIPTION = 'description';
const ADDCOMMENT = 'addcomment';
const DUEDATE = 'duedate';
const PRIORITY = 'priority';
const TAGS = 'tags';

class CardModal extends Component {

    constructor(props) {
        super(props);

        // bind function to component event listener can be added/removed 
        this.keyDown = this.keyDown.bind(this);

        var card_tags = [];
        card_tags = card_tags.concat(props.card.card_tags);

        this.state = {
            renameCardFormOpen: false,
            deleteCardFormOpen: false,
            editDescriptionFormOpen: false,
            commentFormOpen: false,
            dueDateFormOpen: false,
            priorityFormOpen: false,
            tagFormOpen: false,
            renameCardFormInput: props.card.card_name,
            editDescriptionFormInput: props.card.card_description || '',
            commentFormInput: '',
            tagFormSelections: card_tags
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

    togglePriorityForm() {
        this.setState({priorityFormOpen: !this.state.priorityFormOpen});
    }

    editPriority(priority) {
        if (priority === -1 || priority === this.props.card.card_priority) {
            this.setState({priorityFormOpen: false});
            return;
        }

        console.log('Set priority to: ', priority);
        
        fetch('http://localhost:3001/updatecard/priority/' + this.props.card.card_id, {
            method: 'post',
            body: JSON.stringify({
                token: localStorage.getItem('kanboard-user-token'),
                card_priority: priority
            }),
            headers: {'content-type': 'application/json'}
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with edit priority fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                console.log(data.message);

                this.setState({priorityFormOpen: false});

                // update in redux
                this.props.updateCard(this.props.card.card_id, {card_priority: priority}, PRIORITY);
            }
        });
        
    }

    toggleTagForm() {
        this.setState({tagFormOpen: !this.state.tagFormOpen});
    }

    selectTag(tag) {
        var updatedTagSelections = this.state.tagFormSelections;

        if (updatedTagSelections.includes(tag)) {
            var index = updatedTagSelections.indexOf(tag);
            if (index !== -1) {
                updatedTagSelections.splice(index, 1);
            }
            else {
                console.log("Error: Deselected tag that shouldn't have been selected.");
            }
        }
        else {
            updatedTagSelections.push(tag);
        }

        this.setState({tagFormSelections: updatedTagSelections});
    }

    editTags() {
        var new_tags = this.state.tagFormSelections;

        if (new_tags === this.props.card.card_tags) {
            this.setState({tagFormOpen: false});
            return;
        }

        fetch('http://localhost:3001/updatecard/tags/' + this.props.card.card_id, {
            method: 'post',
            body: JSON.stringify({
                token: localStorage.getItem('kanboard-user-token'),
                card_tags: new_tags
            }),
            headers: {'content-type': 'application/json'}
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with edit tags fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                console.log(data.message);

                this.setState({tagFormOpen: false});

                // update in redux
                this.props.updateCard(this.props.card.card_id, {card_tags: new_tags}, TAGS);
            }
        });
    }

    handleChange = (e) => {
        this.setState({[e.target.id]: e.target.value});
    }
    

    render() {
        // get card data from props, this holds all card data
        var card = this.props.card;

        // get card tags if there are any
        var tags = null;
        if (card.card_tags !== null && card.card_tags.length > 0) {
            tags = card.card_tags.map((tag, index) => {
                var tagClass = 'tag tag-' + tag.toLowerCase();
                return(
                    <span className={tagClass} onClick={() => this.toggleTagForm()} key={index}>{tag}</span> 
                )
            });
        }

        var tagArray = null;
        if (this.state.tagFormOpen) {
            var possibleTags = ['Bug', 'Feature', 'Frontend', 'Backend', 
                'Database', 'QuickFix', 'UserStory', 'Epic'
            ];

            tagArray = possibleTags.map((tag, index) => {
                var possibleTagClass = 'possible-tag';
                if (this.state.tagFormSelections.includes(tag)) {
                    possibleTagClass += ' selected'
                }

                return (
                    <button className={possibleTagClass} onClick={() => this.selectTag(tag)} key={index}>{tag}</button>
                )
            })

        }

        // get card due date if there is one
        var due = null;
        var overdue = false;
        if (card.card_due !== null) {
            due = new Date(card.card_due);
            var today = new Date().setHours(0, 0, 0, 0);
            if (due < today) {
                console.log('overdue');
                overdue = true;
            }
            due = due.toDateString();
        }

        // get card priority if there is one
        var priority = null;
        var priorityClass = null;
        var priorityText = null;
        if (card.card_priority !== null) {
            priority = card.card_priority;
            switch(priority) {
                case 0: 
                    priorityClass = 'priority-none';
                    priorityText = 'None';
                    break;
                case 1:
                    priorityClass = 'priority-very-low';
                    priorityText = 'Very Low';
                    break;
                case 2: 
                    priorityClass = 'priority-low';
                    priorityText = 'Low';
                    break;
                case 3:
                    priorityClass = 'priority-medium';
                    priorityText = 'Medium';
                    break;
                case 4: 
                    priorityClass = 'priority-high';
                    priorityText = 'High';
                    break;
                case 5:
                    priorityClass = 'priority-very-high';
                    priorityText = 'Very High';
                    break;
                default:
                    break;
            }
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
                        {/* CARD NAME & RENAME FORM */}
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
                                {/* TAGS & EDIT TAGS FORM */}
                                <div className="card-modal-tags">
                                    {/* <p className="card-modal-item"><i className="fas fa-tag"></i> Tags {tags || <span className="tag tag-none" onClick={() => this.toggleTagForm()}>None</span>}</p> */}
                                    <p className="card-modal-item"><i className="fas fa-tag"></i> Tags </p>
                                    <div className="tags-list">{tags || <span className="tag tag-none" onClick={() => this.toggleTagForm()}>None</span>}</div>
                                    {this.state.tagFormOpen &&
                                        <div className="edit-tags-form">
                                            <p>Select tags for this card:</p>
                                            <div className="possible-tags">
                                                {tagArray}
                                            </div>
                                            <button onClick={() => this.editTags()} className="save-tags-button">Save Tags <i className="fas fa-check"></i></button>
                                            <button onClick={() => this.toggleTagForm()} className="cancel-tags-button">Cancel <i className="fas fa-ban"></i></button>
                                        </div>
                                    }
                                </div>
                                {/* DUE DATE & DUE DATE FORM */}
                                <div className="card-modal-due-date">
                                <p className="card-modal-item"><i className="fas fa-clock"></i> Due Date <span className="due-date-text" onClick={() => this.toggleDueDateForm()}>{due || "None"}</span> {overdue && <span className="due-overdue">(Overdue)</span>}</p>
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
                                {/* PRIORITY & EDIT PRIORITY FORM */}
                                <div className="card-modal-priority">
                                    <p className="card-modal-item"><i className="fas fa-exclamation-circle"></i> Priority <span className={"priority-text " + (priorityClass || "")} onClick={() => this.togglePriorityForm()}>{priorityText || "None"}</span></p>
                                    {this.state.priorityFormOpen &&
                                        <div className="edit-priority-form">
                                            <p className="edit-priority-text">Select a priority level: </p>
                                            <button onClick={() => this.editPriority(0)} className="set-priority-button priority-none">None</button>
                                            <button onClick={() => this.editPriority(1)} className="set-priority-button priority-very-low">Very Low</button>
                                            <button onClick={() => this.editPriority(2)} className="set-priority-button priority-low">Low</button>
                                            <br />
                                            <button onClick={() => this.editPriority(3)} className="set-priority-button priority-medium">Medium</button>
                                            <button onClick={() => this.editPriority(4)} className="set-priority-button priority-high">High</button>
                                            <button onClick={() => this.editPriority(5)} className="set-priority-button priority-very-high">Very High</button>
                                            <button onClick={() => this.editPriority(-1)} className="cancel-priority-button">Cancel <i className="fas fa-ban"></i></button>
                                        </div>
                                    }
                                </div>
                                {/* DESCRIPTION & EDIT DESCRIPTION FORM */}
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
                                                onKeyDown={(e) => {if (e.keyCode === 13 && e.ctrlKey) this.editDescription()}}
                                            />
                                        </div>
                                    }
                                </div>
                                {/* COMMENTS & ADD COMMENTS FORM */}
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
                                                onKeyDown={(e) => {if (e.keyCode === 13 && e.ctrlKey) this.addComment()}}
                                            />
                                            <button onClick={() => this.addComment()} className="save-comment-button">Save Comment <i className="fas fa-check"></i></button>
                                            <button onClick={() => this.toggleCommentForm()} className="cancel-comment-button">Cancel <i className="fas fa-ban"></i></button>
                                        </div>
                                    }
                                    {comments || <p>No comments here</p>}
                                </div>
                            </div>
                            <div className="card-modal-right">
                                {/* ASSIGNEES & ADD ASSIGNEES FORM */}
                                <div className="card-modal-assignees">
                                    <p className="card-modal-item small-margin"><i className="fas fa-user-circle"></i> Assignees</p>
                                </div>
                                {/* CARD OPTIONS BUTTONS & DELETE FORM */}
                                <div className="card-modal-options-buttons">
                                    <p className="card-modal-item small-margin"><i className="fas fa-cog"></i> Options</p>
                                    <button>Add Assignees</button>
                                    <button>Add Tags</button>
                                    <button onClick={() => this.toggleDueDateForm()}>Change Due Date</button>
                                    <button onClick={() => this.togglePriorityForm()}>Set Priority</button>
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