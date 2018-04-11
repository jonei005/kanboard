import React, { Component } from 'react';

class DashboardTileRename extends Component {

    constructor(props) {
        super(props);

        this.state = {
            name: props.name
        }
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
    }

    submitRename = () => {
        var newName = this.state.name;
        if (newName.length === 0) {
            return;
        }
        this.props.submitRename(newName);
    }

    render() {
        return(
            <div className="dashboard-tile-rename-form">
                <input type="text" value={this.state.name} onChange={this.handleChange} id="name" /> 
                <button className="text-submit-button" title="Submit Rename" onClick={this.submitRename} 
                    onKeyDown={(e) => {if (e.keyCode === 13) this.submitRename()}}>
                    <i className="fas fa-arrow-right"></i>
                </button>
            </div>
            
        );
    }
}

export default DashboardTileRename;