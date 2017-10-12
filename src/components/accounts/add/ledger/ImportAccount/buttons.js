import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import ledger from 'store/ledger/';
import screen from 'store/wallet/screen';
import accounts from 'store/vault/accounts/';

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
    );
};

Render.propTypes = {
    selected: PropTypes.bool,
    onAddSelected: PropTypes.func,
    onCancel: PropTypes.func,
};

export default connect(
    (state, ownProps) => ({
        selected: state.ledger.get('selected').size > 0,
    }),
    (dispatch, ownProps) => ({
        onAddSelected: () => {
            let acc = null;
            dispatch(ledger.actions.importSelected())
                .then((address) => {
                    acc = Immutable.fromJS({ id: address });
                    return dispatch(accounts.actions.loadAccountsList());
                })
                .then(() => {
                    return dispatch(screen.actions.gotoScreen('account', acc));
                });
        },
        onCancel: () => {
            dispatch(screen.actions.gotoScreen('home'));
        },
    })
)(Render);
