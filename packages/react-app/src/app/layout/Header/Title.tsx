import { IState, screen } from '@emeraldwallet/store';
import { Theme, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
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
    },
    productPart: {
      color: theme.palette.secondary.main,
    },
  }),
);

interface DispatchProps {
  gotoWalletsScreen(): void;
}

const Component: React.FC<DispatchProps> = ({ gotoWalletsScreen }) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div className={styles.title} onClick={gotoWalletsScreen}>
        <span className={styles.brandPart}>Emerald</span>
        <span className={styles.productPart}>Wallet</span>
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
