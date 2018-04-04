import React, { Component } from 'react';
import Card from './Card';

class Column extends Component {

    constructor(props) {
        super(props);

        this.state = {
            columnMenuOpen: false,
            deleteColumnDialogOpen: false,
            renameColumnDialogOpen: false,
            renameColumnText: props.name
        };

        this.pageClick = this.pageClick.bind(this);
    }

    addCard() {
        alert('Want to add a new card...');
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

        // set renameColumnText to new column_name
        this.setState({renameColumnText: column_name});



    }

    render() {

        var cardArray = this.props.cards;
        var cards = cardArray.map((card, index) => {
            return <Card name={card.card_name} key={index} />
        });

        return(
            <div className="column">
                {this.state.renameColumnDialogOpen 
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

                    : <h3 className="column-name">{this.props.name}</h3>
                }
                
                {this.state.deleteColumnDialogOpen &&
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
                <button className="add-card-button" onClick={() => this.addCard()}>
                    Add Card
                </button>
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

export default Column;