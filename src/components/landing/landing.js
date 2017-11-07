import React from 'react';
import PropTypes from 'prop-types';
import Button from 'elements/Button';
import FlatButton from 'material-ui/FlatButton';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';

import logo from 'images/etc_logo.png';
import version from '../../version';
import classes from './landing.scss';
import { LogoIcon } from 'elements/Icons';
import Divider from 'material-ui/Divider';
import screen from '../../store/wallet/screen';

const Render = ({ message, level, ready, needSetup, onGenerate, onImportjson, onLedger, onLedgerWait, connected }) => {

    const logoStyles = {
        row: {
            paddingTop: '10px',
        },
        img: {
            height: 128,
        },
    };
    return (
      <div>
          <div style={{display: 'flex', alignItems: 'stretch'}}>
            <div style={{flexGrow: 1}}>
                <Row style={{padding: 0, margin: 0}}>
                    <Col style={{backgroundColor: 'white', padding: 0}} xs={12}>
                          <div style={{display: 'flex', alignItems: 'center', marginLeft: '75px', marginTop: '60px'}}>
                            <div><LogoIcon height="33px" width="17px" /></div>
                            <div className={ classes.title } style={{marginLeft: '18px', color: '#47B04B' }}>EMERALD WALLET</div>
                          </div>
                          <br />
                          <div style={{marginLeft: '100px', padding: '10px'}}>
                              <span>
                                  Ethereum Classic is a decentralized platform that runs smart contracts: applications that run exactly as programmed without any possibility of downtime, censorship, fraud or third party interference.
                              </span>
                              <br />
                              <br />
                              <Button label="More about ethereum classic" />
                              <br />
                              <br />
                              <Button primary onClick={onGenerate} label="Generate New Account" />
                              <br />
                              <br />
                          </div>
                          <Divider />
                          <div style={{marginLeft: '100px', marginBottom: '70px'}}>
                            <div className={ classes.title, classes.addwallet }>Add Account</div>
                            <div style={{display: 'flex', alignItems: 'start', flexDirection: 'column', justifyContent: 'center'}}>
                              <FlatButton style={{color: '#47B04B' }} onClick={onImportjson} label="From Keystore File (UTC/JSON)" />
                              <FlatButton style={{color: '#47B04B' }} onClick={connected ? onLedger : onLedgerWait} label="Ledger Nano S" />
                            </div>
                          </div>
                    </Col>
                </Row>
            </div>
        </div>
      </div>
    );
};

Render.propTypes = {
    message: PropTypes.string,
    level: PropTypes.number,
    ready: PropTypes.bool.isRequired,
    needSetup: PropTypes.bool.isRequired,
};

function needSetup(state) {
    return state.launcher.get('terms') !== 'v1'
        || state.launcher.getIn(['geth', 'type']) === 'none'
        || state.launcher.get('settingsUpdated') === true;
}

const Landing = connect(
    (state, ownProps) => ({
        connected: state.ledger.get('connected'),
        message: state.launcher.getIn(['message', 'text']),
        level: state.launcher.getIn(['message', 'level']),
        ready: state.launcher.getIn(['geth', 'status']) === 'ready'
                && state.launcher.getIn(['connector', 'status']) === 'ready',
        needSetup: needSetup(state),
    }),
    (dispatch, ownProps) => ({
      onGenerate() {
          dispatch(screen.actions.gotoScreen('landing-generate'));
      },
      onImportjson() {
          dispatch(screen.actions.gotoScreen('landing-importjson'));
      },
      onLedger() {
          dispatch(screen.actions.gotoScreen('landing-add-from-ledger', 'landing'));
      },
      onLedgerWait() {
          dispatch(screen.actions.showDialog('ledger-wait'));
      }
    })
)(Render);

export default Landing;