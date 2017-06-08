import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

import { cardSpace } from 'lib/styles';
import { renderFileField, renderTextField } from 'elements/formFields';

import Immutable from 'immutable';
import { gotoScreen } from 'store/screenActions';
import { importWallet } from 'store/accountActions';
import { required } from 'lib/validators';
import { translate } from 'react-i18next';
import AccountShow from '../show';

class ImportRender extends React.Component {
    constructor(props) {
        super(props);
        this.submitFile = this.submitFile.bind(this);
        this.state = {
            fileError: null,
            accountId: null,
        };
    }

    submitFile() {
        this.props.handleSubmit().then((result) => {
            if (result.error) {
                this.setState({ fileError: result.error.toString() });
            } else {
                this.setState({ accountId: result });
            }
        });
    }

    render() {
        const { t, accounts } = this.props;
        const { submitSucceeded, invalid, pristine, submitting, cancel } = this.props;

        const p = this.state.accountId && accounts.findKey(this.state.accountId);
        const account = p && (p >= 0) && accounts.get(p);

        return (
            <Card style={cardSpace}>
                <CardHeader
                    title={t("import.title")}
                    actAsExpander={false}
                    showExpandableButton={false}
                />

                <CardText expandable={submitSucceeded}>
                    <form>
                        <Field name="name"
                                component={renderTextField}
                                type="text"
                                label={t("import.name")} />
                         <Field name="description"
                                component={renderTextField}
                                type="text"
                                label={t("import.description")} />
                        <Field name="wallet"
                                component={renderFileField}
                                validate={required} />
                        <FlatButton label={t("common:submit")}
                                    onClick={this.submitFile}
                                    disabled={pristine || submitting || invalid } />
                    </form>
                </CardText>
                {account && <CardText>
                     <AccountShow key={(account === undefined) ? undefined : account.get('id')} account={account}/>
                     <FlatButton label={t("common:done")}
                                onClick={cancel}
                                icon={<FontIcon className="fa fa-home" />}/>
                </CardText>}
                {this.state.fileError}
                {this.state.fileError && <CardText>
                    {this.state.fileError}
                </CardText>}
                <CardActions>
                    <FlatButton label={t("common:cancel")}
                                onClick={cancel}
                                icon={<FontIcon className="fa fa-ban" />}/>
                </CardActions>
            </Card>
        );
    }
}

ImportRender.propTypes = {
    account: PropTypes.object.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    invalid: PropTypes.bool.isRequired,
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    cancel: PropTypes.func.isRequired,
};

const ImportRenderT = translate("accounts")(ImportRender);

const ImportAccountForm = reduxForm({
    form: 'importjson',
    fields: ['wallet'],
})(ImportRenderT);

const ImportAccount = connect(
    (state, ownProps) => ({
        account: state.accounts.get('accounts', Immutable.List()).last(),
        accounts: state.accounts.get('accounts', Immutable.List()),
    }),
    (dispatch, ownProps) => ({
        onSubmit: (data) => {
            return new Promise((resolve, reject) => {
                dispatch(importWallet(data.wallet[0], data.name, data.description))
                        .then((response) => resolve(response))
                        .catch((response) => resolve(response));
            });
        },
        cancel: () => {
            dispatch(gotoScreen('home'));
        },
    })
)(ImportAccountForm);

export default ImportAccount;
