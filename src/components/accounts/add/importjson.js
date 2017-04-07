import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, reset } from 'redux-form';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

import { cardSpace } from 'lib/styles';
import { renderFileField } from 'elements/formFields';
import { Row, Col } from 'react-flexbox-grid/lib/index';

import Immutable from 'immutable';
import { gotoScreen } from 'store/screenActions';
import { importWallet } from 'store/accountActions';
import { required } from 'lib/validators';
import log from 'loglevel';
import AccountShow from '../show';

const Render = ({account, submitSucceeded, handleSubmit, invalid, pristine, reset, submitting, cancel}) => {

    return (
        <Card style={cardSpace}>
            <CardHeader
                title='Import Wallet'
                actAsExpander={false}
                showExpandableButton={false}
            />

            <CardText expandable={submitSucceeded}>
                <form onSubmit={handleSubmit}>
                    <Field  name="wallet" 
                            component={renderFileField}
                            validate={required} />                 
                    <FlatButton label="Submit" type="submit"
                                disabled={pristine || submitting || invalid } />
                </form>
            </CardText>
            <CardText expandable={!submitSucceeded}>
                 <AccountShow key={(account===undefined) ? undefined : account.get('id')} account={account}/>
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
};

const ImportAccountForm = reduxForm({
    form: 'importjson',
    fields: ['wallet']
})(Render);

const ImportAccount = connect(
    (state, ownProps) => {
        return {
            account: state.accounts.get('accounts', Immutable.List()).last()
        }
    },
    (dispatch, ownProps) => {
        return {
            onSubmit: data => {                
                return new Promise((resolve, reject) => {
                    dispatch(importWallet(data.wallet))
                        .then((response) => {
                            resolve(response);
                        });
                    });
            },
            cancel: () => {
                dispatch(gotoScreen('home'))
            }
        }
    }
)(ImportAccountForm);

export default ImportAccount;