import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { cardSpace } from 'lib/styles';
import { gotoScreen } from 'store/screenActions';
import logo from 'images/etc_logo.png';

const Render = ({ message, level, ready }) => {

    let messageStyle = {
        color: "#999"
    };
    if (level === 3) {
        messageStyle.color = "#f66";
    }

    let readyActions = <div/>;
    if (ready) {
        readyActions = (
            <FlatButton label="Open Wallet"
                        icon={<FontIcon className="fa fa-play-circle" />}/>
        );
    }


    return (
        <Grid id="welcome-screen">
            <Row center="xs" style={{paddingTop: "100px"}}>
                <Col xs>
                    <img src={logo} height={128}/>
                </Col>
            </Row>
            <Row center="xs" style={{paddingTop: "40px"}}>
                <Col xs>
                    <span style={{fontSize: "28px", fontWeight: 900}}>Emerald Wallet</span>
                </Col>
            </Row>
            <Row center="xs" style={{paddingTop: "40px", height: "40px"}}>
                <Col xs>
                    <span style={messageStyle}><i className="fa fa-spin fa-spinner"/> {message}</span>
                </Col>
            </Row>
            <Row end="xs" style={{paddingTop: "170px"}}>
                <Col xs={6}>
                    {readyActions}
                </Col>
            </Row>
        </Grid>
    );
};

Render.propTypes = {
    message: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
    ready: PropTypes.bool.isRequired,
};

const Welcome = connect(
    (state, ownProps) => ({
        message: state.launcher.getIn(["message", "text"]),
        level: state.launcher.getIn(["message", "level"]),
        ready: state.launcher.getIn(["status", "geth"]) === "ready"
                && state.launcher.getIn(["status", "connector"]) === "ready"
    }),
    (dispatch, ownProps) => ({
    })
)(Render);

export default Welcome;
