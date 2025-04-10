import { Versions } from '@emeraldwallet/core';
import { application, screen } from '@emeraldwallet/store';
import { Dialog, DialogContent } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { connect } from 'react-redux';
import About from './About';

export interface OwnProps {
  onClose(): void;
}

interface DispatchProps {
  getVersions(): Promise<Versions>;
  openUrl(url: string): void;
}

const useStyles = makeStyles()({
  root: {
    maxWidth: '680px',
    maxHeight: '410px',
    width: '100%',
  },
  content: {
    overflowX: 'hidden',
    overflowY: 'hidden',
    padding: 0,
  },
});

const AboutDialog: React.FC<OwnProps & DispatchProps> = ({ getVersions, onClose, openUrl }) => {
  const { classes } = useStyles();

  const [versions, setVersions] = React.useState<Versions | undefined>();

  React.useEffect(
    () => {
      getVersions().then(setVersions);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const helpClick = (): void => {
    openUrl('https://go.emrld.io/support');
  };

  const licenseClick = (): void => {
    openUrl('https://github.com/emeraldpay/emerald-wallet/blob/master/LICENSE');
  };

  const onButtonClick = (): void => {
    openUrl('https://emerald.cash');
  };

  return (
    <Dialog classes={{ paper: classes.root }} open={true} onClose={onClose}>
      <DialogContent classes={{ root: classes.content }}>
        {versions != null && (
          <About
            versions={versions}
            onWebsiteClick={onButtonClick}
            onLicenseClick={licenseClick}
            onHelpClick={helpClick}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default connect(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    getVersions() {
      return dispatch(application.actions.getVersions());
    },
    openUrl(url: string) {
      return dispatch(screen.actions.openLink(url));
    },
  }),
)(AboutDialog);
