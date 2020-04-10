import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import NetworkSelector from './NetworkSelector';

const styles = createStyles({
  block: {
    marginLeft: '10px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

interface IStatusProps {
  blockchains: any[];
  classes?: any;
}

const Status = (props: IStatusProps) => {
  return (
    <div className={props.classes.block}>
      <NetworkSelector blockchains={props.blockchains} />
    </div>
  );
};

export default withStyles(styles)(Status);
