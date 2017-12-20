import React from 'react';
import Button from 'elements/Button';
import FlatButton from 'material-ui/FlatButton';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { Logo as LogoIcon } from 'emerald-js-ui/lib/icons';
import Divider from 'material-ui/Divider';
import classes from './landing.scss';
import screen from '../../store/wallet/screen';

const Render = ({ onGenerate, onImportjson, onImportPrivateKey, onLedger, onLedgerWait, connected }) => {
  return (
    <div>
      <div style={{display: 'flex', alignItems: 'stretch'}}>
        <div style={{flexGrow: 1}}>
          <Row style={{padding: 0, margin: 0}}>
            <Col style={{backgroundColor: 'white', padding: 0}} xs={12}>
              <div style={{display: 'flex', alignItems: 'center', marginLeft: '80px', marginTop: '60px'}}>
                <div><LogoIcon height="75px" width="75px" /></div>
                <div className={ classes.title } style={{marginLeft: '5px', color: '#47B04B' }}>EMERALD WALLET</div>
              </div>
              <br />
              <div style={{marginLeft: '150px', padding: '10px', maxWidth: '700px'}}>
                <span style={{color: '#747474', fontWeight: '200'}}>
                                  Ethereum Classic is a decentralized platform that runs smart contracts: applications that run exactly as programmed without any possibility of downtime, censorship, fraud or third party interference.
                </span>
                <br />
                <br />
                <a href="http://ethereumclassic.org">
                  <Button label="More about ethereum classic" />
                </a>
                <br />
                <br />
                <Button primary onClick={onGenerate} label="Generate New Account" />
                <br />
                <br />
              </div>
              <Divider />
              <div style={{marginLeft: '145px', marginBottom: '70px'}}>
                <div className={`${classes.title} ${classes.addwallet}`}>Add Account</div>
                <div className={ classes.addAccountButtons }>
                  <FlatButton style={{color: '#47B04B' }} onClick={onImportjson} label="From Keystore File (UTC/JSON)" />
                  <FlatButton style={{color: '#47B04B' }} onClick={onImportPrivateKey} label="From Private key" />
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

const Landing = connect(
  (state, ownProps) => ({
    connected: state.ledger.get('connected'),
  }),
  (dispatch, ownProps) => ({
    onGenerate() {
      dispatch(screen.actions.gotoScreen('landing-generate'));
    },
    onImportjson() {
      dispatch(screen.actions.gotoScreen('landing-importjson'));
    },
    onImportPrivateKey() {
      dispatch(screen.actions.gotoScreen('landing-import-private-key'));
    },
    onLedger() {
      dispatch(screen.actions.gotoScreen('landing-add-from-ledger', 'landing'));
    },
    onLedgerWait() {
      dispatch(screen.actions.showDialog('ledger-wait'));
    },
  })
)(Render);

export default Landing;
