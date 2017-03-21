import React from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux'
import { Field, reduxForm, reset } from 'redux-form'
import TextField from 'material-ui/TextField'
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'

import { cardSpace } from 'lib/styles'
import { Row, Col } from 'react-flexbox-grid/lib/index'

import Immutable from 'immutable'
import { gotoScreen } from 'store/screenActions'
import { loadAccountsList, createAccount } from 'store/accountActions'
import { required, minLength, passwordMatch } from 'lib/validators'
import log from 'loglevel'
import AccountShow from '../show'

const renderFileField = ({ input, name, meta: { touched, error } }) => (
  <div>
    <Dropzone rejectStyle name={name} onDrop={( filesToUpload, e ) => input.onChange(filesToUpload)}>
        <FlatButton label="Select Wallet File..."
                            icon={<FontIcon className="fa fa-briefcase" />}/>
    </Dropzone>
    {touched && error &&
        <span className="error">{error}</span>}    
  </div>
)

const Render = ({account, submitSucceeded, handleSubmit, onDrop, pristine, reset, submitting, cancel}) => {

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
                            component={renderFileField} />
                    <FlatButton label="Submit" type="submit"
                                disabled={pristine || submitting } />
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
}

const ImportAccountForm = reduxForm({
    form: 'importjson',
    fields: ['wallet']
})(Render);

const ImportAccount = connect(
    (state, ownProps) => {
        console.log(state)
        return {
            account: state.accounts.get('accounts', Immutable.List()).last()
        }
    },
    (dispatch, ownProps) => {
        return {
            onDrop: data => {
                console.log(data)
            },
            onSubmit: data => {                
                return new Promise((resolve, reject) => {
                    dispatch(createAccount(data.name, data.password))
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