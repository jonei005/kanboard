import React, { Component } from 'react';

class Card extends Component {

    openCard() {
        alert('Opening card');
    }

    render() {
        return(
            <button className="card" onClick={() => this.openCard()}>
                {this.props.name || 'First Card'}
            </button>
        );
    }
}

export default Card;