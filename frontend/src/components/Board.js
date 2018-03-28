import React, { Component } from 'react';

class Board extends Component {



    render() {

        // get board id from pathname (ex: '/board/6')
        // split string on '/' characters, then get 3rd entry (just the '6)
        var board_id = this.props.location.pathname.split('/')[2];

        return(
            <div className="board container">
                <h1 className="page-title">Board ID: {board_id}</h1>
                <hr className="title-underline" />
            </div>
        );
    }
}

export default Board;
