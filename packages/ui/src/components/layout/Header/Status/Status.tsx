import { CSSProperties } from '@material-ui/styles';
import * as React from 'react';
import NetworkSelector from './NetworkSelector';

const styles = {
  block: {
    marginLeft: '10px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  } as CSSProperties
};

interface Props {
  blockchains: any[];
}

const Status = (props: Props) => {
  return (
    <div style={styles.block}>
      <NetworkSelector blockchains={props.blockchains} />
    </div>
  );
};

export default Status;
