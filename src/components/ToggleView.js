import React, { Component } from 'react';
import ObjectPicking from './ObjectPicking';
import PointRaycasting from './PointRaycasting';

class ToggleView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            toggle: false
        }
    }

    toggleView = () => {
        let toggle;
        toggle = this.state.toggle ? false : true;
        this.setState({toggle});
    }

    render () {
        return(
            <div>
                <div className="header">
                    <p>Three.js Tutorials/Examples adapted for React</p>
                    <button onClick={this.toggleView}>toggle tutorial</button>
                </div>
                {!this.state.toggle && <PointRaycasting />}
                {this.state.toggle && <ObjectPicking />}
            </div>
        );
    }
    
}

export default ToggleView;