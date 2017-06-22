import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { cardSpace } from 'lib/styles';
import { gotoScreen } from 'store/screenActions';
import logo from 'images/etc_logo.png';

const Render = ({ message, level, ready, gohome, isFirstRun }) => {

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
                        icon={<FontIcon className="fa fa-play-circle" />}
                        style={{backgroundColor: 'limegreen', color: 'white'}}
                        onClick={gohome}/>
        );
    }


    return (
        <Grid id="welcome-screen">
            <Row center="xs" style={{paddingTop: '150px'}}>
                <Col xs>
                    <img src={logo} height={128}/>
                </Col>
            </Row>
            {!ready &&
                <div>
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
                 </div>
            }
            {ready &&
                <Row center="xs" style={{paddingTop: '40px'}}>
                    <Col xs={8}>
                    {
                    isFirstRun &&
                        <div style={{fontWeight: '300'}}>
                        <p>
                        Welcome to Emerald Wallet Beta. Thanks for trying it out!<br/>
                        We're looking forward to an Alpha release by July 20th.
                        </p>
                        <p>
                        Made with ❤️&nbsp; by <strong>ETCDEV</strong> and <strong>many wonderful contributors</strong>.
                        </p>
                        </div>
                    }
                    {readyActions}
                    </Col>
                </Row>
            }
        </Grid>
    );
};

Render.propTypes = {
    message: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
    ready: PropTypes.bool.isRequired,
    gohome: PropTypes.func.isRequired,
    isFirstRun: PropTypes.bool.isRequired,
};

const Welcome = connect(
    (state, ownProps) => ({
        message: state.launcher.getIn(["message", "text"]),
        level: state.launcher.getIn(["message", "level"]),
        ready: state.launcher.getIn(["status", "geth"]) === "ready"
                && state.launcher.getIn(["status", "connector"]) === "ready",
        isFirstRun: state.launcher.get('firstRun'),
    }),
    (dispatch, ownProps) => ({
         gohome: () => {
            dispatch(gotoScreen('home'));
        }
    })
)(Render);

export default Welcome;
