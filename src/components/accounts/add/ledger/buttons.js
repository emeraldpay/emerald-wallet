import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { gotoScreen } from 'store/screenActions';
import { importSelected } from 'store/ledgerActions';

const Render = ({ selected, onAddSelected, onCancel }) => {
    return (
        <Row end="xs">
            <Col xs="4">
                <RaisedButton
                    label="Add Selected"
                    disabled={!selected}
                    primary={true}
                    onClick={onAddSelected}
                    icon={<FontIcon className="fa fa-plus" />}/>
                <RaisedButton
                    label="Cancel"
                    onClick={onCancel}
                    icon={<FontIcon className="fa fa-undo" />}/>
            </Col>
        </Row>
    )
};

Render.propTypes = {
};

const Component = connect(
    (state, ownProps) => ({
        selected: state.ledger.get('selected').size > 0
    }),
    (dispatch, ownProps) => ({
        onAddSelected: () => {
            dispatch(importSelected())
        },
        onCancel: () => {
            dispatch(gotoScreen('home'))
        }
    })
)(Render);

export default Component;