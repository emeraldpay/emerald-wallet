import { application, screen } from '@emeraldwallet/store';
import { Button } from '@emeraldwallet/ui';
import {
  createStyles, Dialog, DialogActions, DialogContent, withStyles
} from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import About from './About';

export interface IRenderProps {
  handleClose?: any;
  classes?: any;
}

interface IDispatchProps {
  getVersions: any;
  openUrl: any;
}

const styles = createStyles({
  root: {
    maxWidth: '680px',
    maxHeight: '410px',
    width: '100%'
  },
  content: {
    overflowX: 'hidden',
    overflowY: 'hidden',
    padding: 0
  }
});

const AboutDialog = (props: IRenderProps & IDispatchProps) => {
  const { handleClose, classes, getVersions, openUrl } = props;
  const [versions, setVersions] = React.useState<any>({});

  React.useEffect(() => {
    async function fetch () {
      const v = await getVersions();
      setVersions(v);
    }
    fetch();
  }, []);

  const helpClick = () => {
    const url = 'https://go.emrld.io/support';
    openUrl(url);
  };

  const licenseClick = () => {
    const url = 'https://github.com/emeraldpay/emerald-wallet/blob/master/LICENSE';
    openUrl(url);
  };

  const onButtonClick = () => {
    const url = 'https://emerald.cash';
    openUrl(url);
  };

  return (
    <Dialog
      classes={{ paper: classes?.root }}
      open={true}
      onClose={handleClose}
    >
      <DialogContent classes={{ root: classes?.content }}>
        <About
          onButtonClick={onButtonClick}
          onLicenseClick={licenseClick}
          onHelpClick={helpClick}
          appVersion={versions.version}
          gitVersion={versions.gitVersion}
          osVersion={versions.os}
        />
      </DialogContent>
    </Dialog>
  );
};

function mapDispatchToProps (dispatch: any) {
  return {
    getVersions: () => dispatch(application.actions.getVersions()),
    openUrl: (url: string) => dispatch(screen.actions.openLink(url))
  };
}

const styled = withStyles(styles)(AboutDialog);

export default connect(null, mapDispatchToProps)(styled);
