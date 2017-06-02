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

const Render = translate("accounts")(({ t, account, submitSucceeded, handleSubmit, invalid, pristine, reset, submitting, cancel }) => (
    <Card style={cardSpace}>
        <CardHeader
            title={t("import.title")}
            actAsExpander={false}
            showExpandableButton={false}
        />

        <CardText expandable={submitSucceeded}>
            <form onSubmit={handleSubmit}>
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
                <FlatButton label={t("common:submit")} type="submit"
                            disabled={pristine || submitting || invalid } />
            </form>
        </CardText>
        <CardText expandable={!submitSucceeded}>
             <AccountShow key={(account === undefined) ? undefined : account.get('id')} account={account}/>
             <FlatButton label={t("common:done")}
                        onClick={cancel}
                        icon={<FontIcon className="fa fa-home" />}/>
        </CardText>
        <CardActions>
            <FlatButton label={t("common:cancel")}
                        onClick={cancel}
                        icon={<FontIcon className="fa fa-ban" />}/>
        </CardActions>
    </Card>
));

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
        onSubmit: (data) => {
            dispatch(importWallet(data.wallet[0], data.name, data.description))
        },
        cancel: () => {
            dispatch(gotoScreen('home'));
        },
    })
)(ImportAccountForm);

export default ImportAccount;
