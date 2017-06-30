import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { cardSpace } from 'lib/styles';
import { gotoScreen } from 'store/screenActions';
import InitialSetup from './initialSetup';
import logo from 'images/etc_logo.png';

const Render = ({ message, level, ready, needSetup }) => {

    let messageStyle = {
        color: "#999"
    };
    if (level === 3) {
        messageStyle.color = "#f66";
    }

    let body = <div>
        <Row center="xs" style={{paddingTop: "40px"}}>
            <Col xs={12}>
                <span style={{fontSize: "28px", fontWeight: 900}}>Emerald Wallet</span>
            </Col>
            <Col xs={12}>
                <span style={{fontSize: "16px", fontWeight: 500}}>Version: 0.2.0 Alpha</span>
            </Col>
            <Col xs={12}>
                <span style={{fontSize: "12px", fontWeight: 400, color: "#999"}}>
                    (initial version, please don't use for serious stuff before next Beta release)
                </span>
            </Col>
        </Row>
        <Row center="xs" style={{paddingTop: "40px", height: "40px"}}>
            <Col xs>
                <span style={messageStyle}><i className="fa fa-spin fa-spinner"/> {message}</span>
            </Col>
        </Row>
    </div>;

    const logoStyles = {
        row: {
            paddingTop: "150px"
        },
        img: {
            height: 128
        }
    };

    if (needSetup) {
        body = <Row>
            <Col xs={8} xsOffset={2}>
                <InitialSetup/>
            </Col>
        </Row>;
        logoStyles.row.paddingTop = "20px";
        logoStyles.img.height = 64;
    }

    return (
        <Grid id="welcome-screen">
            <Row center="xs" style={logoStyles.row}>
                <Col xs>
                    <img src={logo} height={logoStyles.img.height}/>
                </Col>
            </Row>
            {body}
        </Grid>
    );
};

Render.propTypes = {
    message: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
    ready: PropTypes.bool.isRequired,
    needSetup: PropTypes.bool.isRequired,
};

function needSetup(state) {
    return state.launcher.get('terms') !== "v1"
        || state.launcher.getIn(["chain", "rpc"]) === "none"
        || state.launcher.get("settingsUpdated") === true
}

const Welcome = connect(
    (state, ownProps) => ({
        message: state.launcher.getIn(["message", "text"]),
        level: state.launcher.getIn(["message", "level"]),
        ready: state.launcher.getIn(["status", "geth"]) === "ready"
                && state.launcher.getIn(["status", "connector"]) === "ready",
        needSetup: needSetup(state)
    }),
    (dispatch, ownProps) => ({
    })
)(Render);

export default Welcome;
