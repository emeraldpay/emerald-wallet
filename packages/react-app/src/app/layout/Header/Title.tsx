import { IState, screen } from '@emeraldwallet/store';
import { Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles()((theme) => ({
  root: {
    flexGrow: 1,
    fontSize: '16px',
  },
  title: {
    cursor: 'pointer',
    display: 'inline-block',
  },
  brandPart: {
    color: theme.palette.primary.main,
    marginRight: '4px',
    float: 'left',
  },
  productPart: {
    color: theme.palette.secondary.main,
    float: 'left',
  },
}));

interface DispatchProps {
  gotoWalletsScreen(): void;
}

const Component: React.FC<DispatchProps> = ({ gotoWalletsScreen }) => {
  const { classes } = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.title} onClick={gotoWalletsScreen}>
        <Typography className={classes.brandPart}>Emerald</Typography>
        <Typography className={classes.productPart}>Wallet</Typography>
      </div>
    </div>
  );
};

export default connect<{}, DispatchProps, {}, IState>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    gotoWalletsScreen() {
      dispatch(screen.actions.gotoWalletsScreen());
    },
  }),
)(Component);
