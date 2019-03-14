import React from 'react';
import {ipcRenderer} from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import {MuiThemeProvider} from '@material-ui/core/styles';
import theme from '@emeraldplatform/ui/lib/theme';
import {About} from '@emeraldwallet/ui';
import {version} from '../../../package.json';

class AboutContainer extends React.Component {
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
    const {
      onButtonClick, onHelpClick, onLicenseClick,
    } = this.props;
    const {geth, connector} = this.state;
    return (
      <MuiThemeProvider theme={theme}>
        <About
          appVersion={version}
          endpointVersion={geth}
          vaultVersion={connector}
          onButtonClick={onButtonClick}
          onHelpClick={onHelpClick}
          onLicenseClick={onLicenseClick}
        />
      </MuiThemeProvider>);
  }
}

export default AboutContainer;
