import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import Divider from 'material-ui/Divider';
import { Button } from 'emerald-js-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';

const Landing = ({ onGenerate, onImportJson, onImportPrivateKey, onLedger, muiTheme }) => {
  const styles = {
    addAccount: {
      color: muiTheme.palette.textColor,
      fontWeight: '500',
      padding: '20px',
      fontSize: '17px',
      paddingLeft: '15px',
    },
    addAccountButtons: {
      display: 'flex',
      alignItems: 'start',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  };
  return (
    <div>
      <div style={{display: 'flex', alignItems: 'stretch'}}>
        <div style={{flexGrow: 1}}>
          <Row style={{padding: 0, margin: 0}}>
            <Col style={{backgroundColor: muiTheme.palette.canvasColor, padding: 0}} xs={12}>
              <div style={{display: 'flex', alignItems: 'center', marginLeft: '80px', marginTop: '60px'}}>
                <div style={{fontWeight: '500', marginLeft: '80px', color: muiTheme.palette.primary1Color}}>WELCOME TO EMERALD WALLET</div>
              </div>
              <br />
              <div style={{marginLeft: '150px', padding: '10px', maxWidth: '700px'}}>
                <span style={{color: muiTheme.palette.primary3Color, fontWeight: '200'}}>
      Emerald Wallet runs on the Ethereum Classic platform. Ethereum Classic is a decentralized platform that runs smart contracts: applications that run exactly as programmed without any possibility of downtime, censorship, fraud or third party interference.
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
                <div style={styles.addAccount}>Add Account</div>
                <div style={styles.addAccountButtons}>
                  <FlatButton primary onClick={onImportJson} label="From Keystore File (UTC/JSON)" />
                  <FlatButton primary onClick={onImportPrivateKey} label="From Private key" />
                  <FlatButton primary onClick={onLedger} label="Ledger Nano S" />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default muiThemeable()(Landing);
