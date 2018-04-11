import React, { Component } from 'react';
import Card from './Card';
import { DropTarget } from 'react-dnd';
import dndTypes from './../constants/dndTypes';

// specifies drop target contract, all methods optional
const columnTarget = {
    canDrop(props, monitor) {
        const item = monitor.getItem();
        //console.log('Column canDrop item: ', item);
        // check if its over its same column, or something
        if (item.column_id === props.id) {
            return true;
        }
        else {
            return true;
        }
    },

    drop(props, monitor, component) {
        if (!monitor.didDrop()) {
            //const item = monitor.getItem();
            //console.log("Drop item: ", item);

            // this result can be found in monitor.getDropResult()
            // from the drag source's endDrag() method
            return { 
                moved: true,
                column: true,
                column_id: props.id
            };
        }
    }
}

// specifies which props to inject into component
function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        canDrop: monitor.canDrop()
    }
}

class Column extends Component {

    constructor(props) {
        super(props);

        this.state = {
            columnMenuOpen: false,
            deleteColumnDialogOpen: false,
            renameColumnDialogOpen: false,
            renameColumnText: props.name,
            addCardFormOpen: false,
            addCardText: ''
        };

        this.pageClick = this.pageClick.bind(this);
    }

    addCard() {
        this.setState({addCardFormOpen: false});

        // TODO

        // get relevent data about the card to send to the api
        var card_name = this.state.addCardText;
        if (card_name === '') return;

        var card_position = this.props.cards.length;

        // send column_id, card_name, card_position to api
        this.setState({addCardText: ''});

        var token = localStorage.getItem('kanboard-user-token');

        fetch('http://localhost:3001/addcard/' + this.props.id, {
            method: 'post',
            body: JSON.stringify({
                token: token,
                card_name: card_name,
                card_position: card_position
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with add card fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                this.props.addCard(data.card);
            }
        });
    }

    // open or close add card form based on current state
    toggleAddCardForm() {
        this.setState({addCardFormOpen: !this.state.addCardFormOpen});
    }

    toggleColumnMenu() {
        this.setState({columnMenuOpen: !this.state.columnMenuOpen}, () => {
            // attach click listener to page if form is open, remove if closed
            if (this.state.columnMenuOpen) {
                document.addEventListener('click', this.pageClick, false);
            }
            else {
                document.removeEventListener('click', this.pageClick, false);
            }
        });        
    }

    // handles any click on the page when column menu is open, close on click
    pageClick() {
        this.toggleColumnMenu();
    }

    toggleDeleteColumnDialog() {
        this.setState({deleteColumnDialogOpen: !this.state.deleteColumnDialogOpen});
    }

    deleteColumn(wantToDelete) {
        this.setState({deleteColumnDialogOpen: false});

        if (wantToDelete) {
            var token = localStorage.getItem('kanboard-user-token');

            fetch('http://localhost:3001/deletecolumn/' + this.props.id, {
                method: 'post',
                body: JSON.stringify({
                    token: token
                }),
                headers: {
                    'content-type': 'application/json'
                }
            }).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else {
                    console.log('Hmm something went wrong with delete column fetch', response);
                    return null;
                }
            }).then((data) => {
                if (data) {
                    console.log(data.message);
                    
                    // delete column from redux state based on its column_id
                    this.props.deleteColumn(this.props.id, data.card_ids);
                }
            });
        }
    }

    toggleRenameColumnDialog() {
        this.setState({renameColumnDialogOpen: !this.state.renameColumnDialogOpen});
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
    }

    renameColumn() {
        // get column name from state
        var column_name = this.state.renameColumnText;

        // close rename dialog
        this.setState({renameColumnDialogOpen: false});

        // if new name is same as original name, don't do anything
        if (column_name === this.props.name) {
            return;
        }

        // alert('rename column to: ' + column_name);

        var token = localStorage.getItem('kanboard-user-token');

        // send new column name to api in body
        fetch('http://localhost:3001/updatecolumn/name/' + this.props.id, {
            method: 'post',
            body: JSON.stringify({
                token: token,
                column_name: column_name
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with rename column fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                console.log(data.message);
                
                // send to parent to rename column in redux store based on its column_id
                this.props.renameColumn(this.props.id, column_name);
            }
            else {
                // if rename didn't work in database, then 
                // reset the rename form text to the old name
                this.setState({renameColumnText: this.props.name});
            }
        });
    }

    render() {

        const { canDrop, connectDropTarget } = this.props;

        var cardArray = this.props.cards;

        // sort cards by position
        cardArray.sort((card1, card2) => {
            return card1.card_position - card2.card_position;
        });

        var cards = cardArray.map((card, index) => {
            return <Card name={card.card_name} id={card.card_id} 
                column={this.props.id} position={card.card_position} key={index} />
        });

        return connectDropTarget(
            <div className={"column" + (canDrop ? " can-drop" : "")} >
                {this.state.renameColumnDialogOpen /* Render the rename form or the name of the column */
                    ? 
                        <div className="rename-column-dialog">
                            <input type="text" id="renameColumnText" autoFocus
                                value={this.state.renameColumnText} 
                                onChange={(e) => this.handleChange(e)}
                                onKeyDown={(e) => {if (e.keyCode === 13) this.renameColumn()}}
                                onFocus={(e) => {e.target.select()}} />
                            <button onClick={() => this.renameColumn()}>
                                <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>

                    : <h3 className="column-name" onClick={() => this.toggleRenameColumnDialog()}>{this.props.name}</h3>
                }
                
                {this.state.deleteColumnDialogOpen && /* If deleteColumnDialogOpen is true, render delete column warning */
                    <div className="delete-column-dialog">
                        <div>Are you sure you want to delete this column? All column data, including cards, will be lost forever.</div>
                        <button className="delete-column-button delete" title="Delete Board" onClick={() => this.deleteColumn(true)}>
                            Delete It <i className="fas fa-check"></i>
                        </button> 
                        <button className="delete-column-button cancel" title="Cancel" onClick={() => this.deleteColumn(false)}>
                            Cancel <i className="fas fa-ban"></i>
                        </button>
                    </div>
                }
                {cards}
                {this.state.addCardFormOpen /* If addCardFormOpen is true, render the add card form, else show the button */
                    ? 
                        <div className="add-card-form">
                            <input type="text" id="addCardText" autoFocus placeholder="Name of card"
                                value={this.state.addCardText} 
                                onChange={(e) => this.handleChange(e)}
                                onKeyDown={(e) => {if (e.keyCode === 13) this.addCard()}} />
                            <button onClick={() => this.addCard()}>
                                <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>

                    : <button className="add-card-button" onClick={() => this.toggleAddCardForm()}>Add Card</button>
                }
                
                <div className="column-menu-container">
                    <button className="menu-button" onClick={() => this.toggleColumnMenu()}>
                        <i className="fas fa-ellipsis-v"></i>
                    </button>
                    {this.state.columnMenuOpen &&
                        <div className="column-menu" >
                            <button onClick={() => this.toggleRenameColumnDialog()}>Rename Column</button>
                            <button onClick={() => this.toggleDeleteColumnDialog()}>Delete Column</button>
                            <button onClick={() => this.toggleColumnMenu()}>Close</button>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default DropTarget(dndTypes.CARD, columnTarget, collect)(Column);