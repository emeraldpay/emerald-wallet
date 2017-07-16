import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { gotoScreen } from 'store/screenActions';

const style = {
    spinner: {
        fontWeight: 700,
        fontSize: '18px',
        paddingTop: '30px',
        paddingBottom: '40px',
        color: '#777'
    },
    actions: {
        paddingTop: '40px',
    }
};

const Render = ({ onCancel }) => {
    return (
        <div>
            <Row>
                <Col xs={4} xsOffset={4} style={style.spinner}>
                    <FontIcon className="fa fa-spin fa-spinner"/> Wait for Ledger Connection
                </Col>
            </Row>
            <Row>
                <Col xs={6} xsOffset={3}>
                    Please make sure:
                    <ul>
                        <li>Ledger Device is connected</li>
                        <li>Ethereum App is opened on Ledger Device</li>
                        <li>Browser Mode is switched Off</li>
                    </ul>
                </Col>
            </Row>
            <Row center="xs" style={style.actions}>
                <Col xs>
                    <FlatButton
                        label="Cancel"
                        onClick={onCancel}
                        icon={<FontIcon className="fa fa-cancel" />}/>
                </Col>
            </Row>
        </div>
    )
};

Render.propTypes = {
};

const Component = connect(
    (state, ownProps) => ({
    }),
    (dispatch, ownProps) => ({
        onCancel: () => {
            dispatch(gotoScreen('home'))
        }
    })
)(Render);

export default Component;