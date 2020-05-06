import { Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { screen } from '@emeraldwallet/store';
import { Button } from '@emeraldwallet/ui';
import { createStyles, Grid } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import * as React from 'react';
import { connect } from 'react-redux';

const styles = createStyles({
  containerRoot: {
    minHeight: '300px'
  },
  createBtn: {
    width: '350px'
  },
  importBtn: {
    width: '350px'
  }
});

interface IProps {
  onCreate?: any;
  onImport?: any;
  onBack?: any;
  classes?: any;
}

export function CreateOrImport (props: IProps) {
  const { classes } = props;

  function handleOnCreate () {
    if (props.onCreate) {
      props.onCreate();
    }
  }

  function handleOnImport () {
    if (props.onImport) {
      props.onImport();
    }
  }

  return (
    <Page
      leftIcon={(<Back onClick={props.onBack} />)}
      title={''}
    >
      <Grid
        container={true}
        direction={'column'}
        alignItems={'center'}
        justify={'space-around'}
        classes={{ root: classes?.containerRoot }}
      >
        <Grid item={true} sm={6} xs={6}>
          <Button
            label={'Create a new wallet'}
            primary={true}
            onClick={handleOnCreate}
            classes={{ root: classes?.createBtn }}
          />
        </Grid>
        <Grid item={true} sm={6} xs={6}>
          <Button
            label={'Import existing'}
            onClick={handleOnImport}
            classes={{ root: classes?.importBtn }}
          />
        </Grid>
      </Grid>
    </Page>
  );
}

function mapDispatchToProps (dispatch: any) {
  return {
    onBack: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
    },
    onCreate: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_WALLET));
    },
    onImport: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.IMPORT_WALLET));
    }
  };
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(CreateOrImport));
