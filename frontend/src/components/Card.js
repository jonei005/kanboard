import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import dndTypes from './../constants/dndTypes';


// specifies drag source contract (what to do when begin/end drag)
var cardSource = {
    beginDrag(props) {
        // return data describing the dragged item
        const item = {
            card_id: props.id,
            column_id: props.column
        };

        return item;
    },

    endDrag(props, monitor, component) {
        // when dropped on compatible target, do something
        
        const item = monitor.getItem();
        const dropResult = monitor.getDropResult();

        if (dropResult && dropResult.moved && dropResult.moved === true) {
            alert("Moved card " + props.id + " from column " + item.column_id + " to column " + dropResult.column_id);
            // now check if its the same column as where it originated from
            // if it is, then only change the position
            // if not, then change ColumnsToCards row as well as the position (make it 0 for now)

            // after changed in DB, change it in redux
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


class Card extends Component {

    openCard() {
        alert('Opening card');
    }

    render() {

        const { isDragging, connectDragSource } = this.props;

        return connectDragSource(
            <button className="card" onClick={() => this.openCard()}>
                {isDragging ? "Dragging..." : this.props.name}
            </button>
        );
    }
}

export default DragSource(dndTypes.CARD, cardSource, collect)(Card);