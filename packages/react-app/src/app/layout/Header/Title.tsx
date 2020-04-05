import { withTheme } from '@material-ui/styles';
import * as React from 'react';

const EmeraldTitle = ({ theme }: {theme: any}) => {
  return (
    <div style={{ fontSize: '16px', flexGrow: 1 }}>
      <span style={{ color: theme.palette.primary.main }}>Emerald </span>
      <span style={{ color: theme.palette.secondary.main }}>Wallet</span>
    </div>
  );
};

export default withTheme(EmeraldTitle);
