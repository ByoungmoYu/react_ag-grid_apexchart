import React, { Component } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

export default class DropdownFloatingFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentValue: 'All'
        };

        this.classes = makeStyles((theme) => ({
            formControl: {
                margin: theme.spacing(1),
                minWidth: 200,
            },
            selectEmpty: {
                marginTop: theme.spacing(2),
            },
        }));
    }

    valueChanged = event => {
        this.setState(
            {
                currentValue: event.target.value,
            },
            () => {
                let valueToUse = this.state.currentValue === 'All' ? '' : this.state.currentValue;
                this.props.parentFilterInstance(function (instance) {
                    // Fire event on floating filter changed
                    // contains type and selected value  
                    instance.onFloatingFilterChanged('contains', valueToUse);
                });
            }
        );
    };

    onParentModelChanged(parentModel) {
        // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
        // so just read off the value and use that
        this.setState({
            currentValue: !parentModel ? 'All' : parentModel.filter,
        });
    }

    /** 
     * Create dynamically menu items 
    */
    createSelectItems() {
        let items = [];
        let props = this.props.items;
        
        for (let i = 0; i < props.length; i++) {
            items.push(<MenuItem key={i} value={props[i]}>{props[i]}</MenuItem>);
        }
        return items;
    }

    render() {
        return (
            <FormControl variant="filled" className={this.classes.formControl}>
                <Select
                    labelId="demo-simple-select-filled-label"
                    id="demo-simple-select-filled"
                    value={this.state.currentValue}
                    onChange={this.valueChanged}
                >
                    <MenuItem value="All" selected={true}>
                        <em>All</em>
                    </MenuItem>
                    {this.createSelectItems()}
                    
                </Select>
            </FormControl>
        );
    }
}