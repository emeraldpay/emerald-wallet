import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import { cardSpace } from 'lib/styles';
import { gotoScreen } from 'store/screenActions';
import ChooseRpc from './chooseRpc';
import OpenWallet from './openWallet';

const Render = ({ rpcType }) => {

    let step = null;
    if (rpcType === 'none') {
        step = <ChooseRpc/>
    } else if (rpcType === 'remote') {
        // step = <ChooseRemote/>
    } else if (rpcType === 'remote-auto') {
        step = <OpenWallet/>;
    }

    let activeStep = 0;
    let steps = [];
    steps.push(
        <Step key="select-rpc">
            <StepLabel>Select RPC type</StepLabel>
        </Step>
    );
    if (rpcType === 'remote') {
        activeStep++;
        steps.push(
            <Step key="select-remote">
                <StepLabel>Select remote node</StepLabel>
            </Step>
        );
    }
    if (rpcType === 'remote-auto') {
        activeStep++
    }
    steps.push(
        <Step key="open-wallet">
            <StepLabel>Open Wallet</StepLabel>
        </Step>
    );


    return (
        <div>
            <Row>
                <Col xs={12}>
                    <Stepper activeStep={activeStep}>
                        {steps.map((step, idx) => step)}
                    </Stepper>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    {step}
                </Col>
            </Row>
        </div>
    )
};


Render.propTypes = {
    rpcType: PropTypes.string.isRequired
};

const InitialSetup = connect(
    (state, ownProps) => ({
        rpcType: state.launcher.getIn(["chain", "rpc"]) || 'none'
    }),
    (dispatch, ownProps) => ({
    })
)(Render);

export default InitialSetup;