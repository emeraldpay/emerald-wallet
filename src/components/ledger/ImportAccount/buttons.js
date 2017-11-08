import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import ledger from 'store/ledger/';
import screen from 'store/wallet/screen';
import accounts from 'store/vault/accounts/';
import Button from 'elements/Button';
import ButtonGroup from 'elements/ButtonGroup';

const Render = ({ selected, onAddSelected, onCancel }) => {
    return (
        <ButtonGroup>
            <Button
                label="Add Selected"
                disabled={!selected}
                primary={true}
                onClick={onAddSelected}
                icon={<FontIcon className="fa fa-plus" />}
            />
            <Button
                label="Cancel"
                onClick={onCancel}
                icon={<FontIcon className="fa fa-undo" />}
            />
        </ButtonGroup>
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
          if (ownProps.onBackScreen) {
            return dispatch(screen.actions.gotoScreen(ownProps.onBackScreen));
          }
          dispatch(screen.actions.gotoScreen('home'));
        },
    })
)(Render);
