import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import dndTypes from './../constants/dndTypes';
import { connect } from 'react-redux';
import { moveCard } from './../actions';

// CARD DRAG SOURCE
// specifies drag source contract (what to do when begin/end drag)
var cardSource = {
    beginDrag(props) {
        // return data describing the dragged item
        const item = {
            card_id: props.id,
            column_id: props.column,
            card_position: props.position
        };

        return item;
    },

    endDrag(props, monitor, component) {
        // when dropped on compatible target, do something
        
        const item = monitor.getItem();
        const dropResult = monitor.getDropResult();


        if (dropResult && dropResult.moved === true) {

            // body will be sent as json request body to api
            var body = null;

            if (dropResult.column === true) {      
                // if card dropped into its own column, do nothing
                if (item.column_id === dropResult.column_id) {
                    return;
                }

                //alert("Column: Moved card " + props.id + " from column " + item.column_id + " to column " + dropResult.column_id + " at position 0");

                body = {
                    token: localStorage.getItem('kanboard-user-token'),
                    old_column_id: item.column_id,
                    new_column_id: dropResult.column_id,
                    old_position: item.card_position,
                    new_position: 0
                };

                // steps:
                // * change ColumnsToCards, old_column_id to new_column_id
                // * find all cards in old_column_id that came after this card
                //   and decrement their positions
                // * change card_position of current card to 0
                // * find all cards in new_column_id and increment their position

                // after changed in DB, change it in redux
            }
            else if (dropResult.card === true) {

                console.log("Dropped on card");

                // if card position is 1 away from target in same column, do nothing
                // ex: pos 0 dropped on top half of pos 1, so it thinks it wants to move to pos 1
                // but really it should stay where it is.
                // if (props.column === dropResult.target_column_id && 
                //     Math.abs(props.position - dropResult.drop_position) <= 1
                // ) {
                //     //console.log("dropped 1 away, do nothing");
                //     return;

                // }

                if (props.column === dropResult.target_column_id &&
                    (dropResult.drop_position - props.position) === 1
                ) {
                    return;
                }

                // if card dropped onto itself, or if position won't change, do nothing
                if (props.id === dropResult.target_card_id) {
                    console.log("do nothing");
                    return;
                }
                else if (props.position === dropResult.drop_position && props.column === dropResult.target_column_id) {
                    console.log("do nothing");
                    return;
                }

                body = {
                    token: localStorage.getItem('kanboard-user-token'),
                    old_column_id: item.column_id,
                    new_column_id: dropResult.target_column_id,
                    old_position: item.card_position,
                    new_position: dropResult.drop_position
                };

                //alert("Card: Moved card " + props.id + " to position " + dropResult.drop_position + " in column " + dropResult.target_column_id);
            }

            if (body) {
                fetch('http://localhost:3001/movecard/' + item.card_id, {
                    method: 'post',
                    body: JSON.stringify(body),
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
                        console.log(data.results);
                    }

                    // redux store stuff
                    props.moveCard(
                        item.card_id,
                        body.old_column_id,
                        body.new_column_id,
                        body.old_position,
                        body.new_position
                    );
                });
            }
        }
    }
}

// specifies which props to inject into the component
function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
}

// CARD DROP TARGET
// 
var cardTarget = {
    drop(props, monitor, component) {
        // determine if we were at the top or bottom of the card
        // this will tell us if we want to insert the card above/below target

        // get middle of card component that we dropped our card onto
        var dropBoundingRect = findDOMNode(component).getBoundingClientRect();
        var dropMiddleY = dropBoundingRect.top + (dropBoundingRect.bottom - dropBoundingRect.top) / 2;

        // get mouse position at time of drop
        var clientOffset = monitor.getClientOffset();

        var positionOffset = -1;
        // remember that higher values are lower on the page
        if (clientOffset.y <= dropMiddleY) {
            // mouse position in top half of target component, so we want to 
            // add the card at the current position of the target card
            positionOffset = 0;
        }
        else {
            // mouse position in bottom half of target component, so we want to
            // add the card AFTER the current position of the target card
            positionOffset = 1;
        }

        console.log("Move card to " + (props.position + positionOffset));



        if (!monitor.didDrop()) { 
            //console.log("dropped on card: " + props.position);

            return {
                moved: true,
                card: true,
                target_card_id: props.id,
                target_column_id: props.column,
                target_card_position: props.position,
                drop_position: props.position + positionOffset
            };
        }
    },

    canDrop(props, monitor) {
        return props.id === monitor.getItem().card_id ? false : true;
    }
}

function dropCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    }
}


class Card extends Component {

    openCardModal() {
        this.props.openCardModal(this.props.id);
    }

    render() {

        const { isDragging, connectDragSource, connectDropTarget, isOver, canDrop } = this.props;

        var dropClasses = (isOver && canDrop) ? " is-over" : "";

        return connectDropTarget(connectDragSource(
            <button className={"card" + dropClasses} onClick={() => this.openCardModal()}>
                {isDragging ? "Dragging..." : this.props.name}
            </button>
        ));
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        moveCard: (card_id, old_col_id, new_col_id, old_card_pos, new_card_pos) => dispatch(
            moveCard(card_id, old_col_id, new_col_id, old_card_pos, new_card_pos)
        )
    }
}

Card = DragSource(dndTypes.CARD, cardSource, collect)(Card);
Card = DropTarget(dndTypes.CARD, cardTarget, dropCollect)(Card);
Card = connect(null, mapDispatchToProps)(Card);

export default Card;

// export default DropTarget(dndTypes.CARD, cardTarget, dropCollect)(
    // DragSource(dndTypes.CARD, cardSource, collect)(Card)
// );