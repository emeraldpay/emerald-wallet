import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

import { cardSpace } from 'lib/styles';
import { renderFileField } from 'elements/formFields';

import Immutable from 'immutable';
import { gotoScreen } from 'store/screenActions';
import { importWallet } from 'store/accountActions';
import { required } from 'lib/validators';
import AccountShow from '../show';

const Render = ({ account, submitSucceeded, handleSubmit, invalid, pristine, reset, submitting, cancel }) => (
    <Card style={cardSpace}>
        <CardHeader
            title='Import Wallet'
            actAsExpander={false}
            showExpandableButton={false}
        />

        <CardText expandable={submitSucceeded}>
            <form onSubmit={handleSubmit}>
                <Field name="wallet"
                        component={renderFileField}
                        validate={required} />
                <FlatButton label="Submit" type="submit"
                            disabled={pristine || submitting || invalid } />
            </form>
        </CardText>
        <CardText expandable={!submitSucceeded}>
             <AccountShow key={(account === undefined) ? undefined : account.get('id')} account={account}/>
             <FlatButton label="Done"
                        onClick={cancel}
                        icon={<FontIcon className="fa fa-home" />}/>
        </CardText>
        <CardActions>
            <FlatButton label="Cancel"
                        onClick={cancel}
                        icon={<FontIcon className="fa fa-ban" />}/>
        </CardActions>
    </Card>
);

Render.propTypes = {
    account: PropTypes.object.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    invalid: PropTypes.bool.isRequired,
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    cancel: PropTypes.func.isRequired,
};

const ImportAccountForm = reduxForm({
    form: 'importjson',
    fields: ['wallet'],
})(Render);

const ImportAccount = connect(
    (state, ownProps) => ({
        account: state.accounts.get('accounts', Immutable.List()).last(),
    }),
    (dispatch, ownProps) => ({
        onSubmit: (data) => new Promise((resolve, reject) => {
            dispatch(importWallet(data.wallet))
                        .then((response) => {
                            resolve(response);
                        });
        }),
        cancel: () => {
            dispatch(gotoScreen('home'));
        },
    })
)(ImportAccountForm);

export default ImportAccount;
