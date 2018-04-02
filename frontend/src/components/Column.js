import React, { Component } from 'react';
import Card from './Card';

class Column extends Component {

    addCard() {
        alert('Want to add a new card...');
    }

    render() {

        // TODO: GET CARDS FROM BOARD PROPS
        var cardArray = this.props.cards;
        var cards = cardArray.map((card, index) => {
            return <Card name={card.card_name} key={index} />
        });

        return(
            <div className="column">
                <h4 className="column-name">{this.props.name}</h4>
                {cards}
                <button className="add-card-button" onClick={() => this.addCard()}>
                    Add Card
                </button>
            </div>
        );
    }
}

export default Column;