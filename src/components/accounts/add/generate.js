import React from 'react';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader'

import { cardSpace } from 'lib/styles'
import { Row, Col } from 'react-flexbox-grid/lib/index'

import { gotoScreen } from 'store/screenActions'
import { positive, number, required, address } from 'lib/validators'
import log from 'loglevel'

class GenerateAccountForm extends Component {
    render() {
        const { handleSubmit } = this.props;
        return (
            <form onSubmit={handleSubmit}>
                    <div>
              <label htmlFor="name">Account Name (optional)</label>
              <Field name="name" component="input" type="text"/>
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <Field name="password" component="input" type="password"/>
            </div>
            <div>
              <label htmlFor="password-conf">Re-Enter Password</label>
              <Field name="password-conf" component="input" type="password"/>
            </div>
            <button type="submit">Submit</button>
          </form>
            );
    }
}

const GenerateAccountForm = reduxForm({
    form: 'generate'
})(GenerateAccountForm);

export default GenerateAccountForm;