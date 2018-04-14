import React, { Component } from 'react';
import './../css/CardModal.css';

class CardModal extends Component {

    constructor(props) {
        super(props);

        // bind function to component event listener can be added/removed 
        this.keyDown = this.keyDown.bind(this);
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
                                    <button>Edit Description</button>
                                    <button>Rename Card</button>
                                    <button>Delete Card</button>
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