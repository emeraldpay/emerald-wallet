import React from 'react';
import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Logo as EtcLogo } from 'emerald-js-ui/lib/icons';
import { Button } from 'emerald-js-ui';
import {version} from '../../../package.json';

const year = new Date().getFullYear();

class AboutClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    ipcRenderer.send('get-version');
    ipcRenderer.once('get-version-result', (event, result) => {
      this.setState({
        geth: result.geth,
        connector: result.connector,
      });
    });
  }

  render() {
    const { muiTheme, onButtonClick, onHelpClick, onLicenseClick } = this.props;
    const { geth, connector } = this.state;
    const styles = {
      links: {
        color: muiTheme.palette.textColor,
      },
    };
    return (
      <div style={{ padding: '30px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-175px' }}>
          <EtcLogo height="350px" width="350px" />
        </div>
        <h2 style={{ color: muiTheme.palette.primary1Color, fontWeight: '200', paddingBottom: '0px', marginBottom: '5px' }}>Emerald Wallet</h2>
        <div style={{ marginBottom: '20px' }}>{version}</div>
        <div style={{ color: muiTheme.palette.secondaryTextColor, fontWeight: '100', lineHeight: '26px', maxWidth: '580px' }}>
          RPC Endpoint: {geth}<br/>
          Emerald Vault: {connector}
        </div>
        <div style={{ paddingTop: '60px', marginBottom: '60px' }}>
          <Button onClick={onButtonClick} primary label='Buy us a Pizza' />
        </div>
        <div style={{ fontSize: '14px' }}>
          <div style={{ paddingBottom: '5px' }}>Copyright &copy; 2017-{year} ETCDEVTeam</div>
          <div> Licensed under <a onClick={onLicenseClick} style={styles.links} href="#">Apache License 2.0</a>
            <span style={{ float: 'right', textAlign: 'right' }}>
              <a onClick={onHelpClick} style={styles.links} href="#">Help & Support</a>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

const About = muiThemeable()(AboutClass);

export default About;
