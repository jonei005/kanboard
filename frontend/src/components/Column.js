import React, { Component } from 'react';
import Card from './Card';

class Column extends Component {

    constructor(props) {
        super(props);

        this.state = {
            columnMenuOpen: false,
            deleteColumnDialogOpen: false
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

    render() {

        var cardArray = this.props.cards;
        var cards = cardArray.map((card, index) => {
            return <Card name={card.card_name} key={index} />
        });

        return(
            <div className="column">
                <h3 className="column-name">{this.props.name}</h3>
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
                            <button>Rename Column</button>
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