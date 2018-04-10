import React, { Component } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import dndTypes from './../constants/dndTypes';

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
            if (dropResult.column === true) {
                alert("Moved card " + props.id + " from column " + item.column_id + " to column " + dropResult.column_id + " at position 0");
                
                // if card dropped into its own column, do nothing
                if (item.column_id === dropResult.column_id) {
                    return;
                }

                // steps:
                // * change ColumnsToCards, old_column_id to new_column_id
                // * find all cards in old_column_id that came after this card
                //   and decrement their positions
                // * change card_position of current card to 0
                // * find all cards in new_column_id and increment their position

                // after changed in DB, change it in redux
            }
            else if (dropResult.card === true) {

                // if card dropped onto itself, do nothing
                if (props.id === dropResult.target_card_id) {
                    return;
                }

                alert("Moved card " + props.id + " to position " + dropResult.target_card_position + " in column " + dropResult.target_column_id);
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
    drop(props, monitor) {
        // determine if we were at the top or bottom of the card
        // this will tell us if we want to insert the card above/below target
        



        if (!monitor.didDrop()) { 
            //console.log("dropped on card: " + props.position);

            return {
                moved: true,
                card: true,
                target_card_id: props.id,
                target_column_id: props.column,
                target_card_position: props.position
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

    openCard() {
        alert('Opening card');
    }

    render() {

        const { isDragging, connectDragSource, connectDropTarget, isOver, canDrop } = this.props;

        var dropClasses = (isOver && canDrop) ? " is-over" : "";

        return connectDropTarget(connectDragSource(
            <button className={"card" + dropClasses} onClick={() => this.openCard()}>
                {isDragging ? "Dragging..." : this.props.name}
            </button>
        ));
    }
}

export default DropTarget(dndTypes.CARD, cardTarget, dropCollect)(DragSource(dndTypes.CARD, cardSource, collect)(Card));