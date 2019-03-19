import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '../../common/Button';
import { PlayCircle } from '@emeraldplatform/ui-icons';

interface Props {
  nextPage?: any;
}

const OpenWallet = ({ nextPage }: Props) => {
  return (
    <Grid>
      <Grid item xs={12}>
        <div style={{fontWeight: 300}}>
          <p>
            Welcome to Emerald Wallet. Thanks for trying it out!<br/>
          </p>
          <p>
            Made with ❤️&nbsp; by <strong>ETCDEV</strong> and <strong>many wonderful contributors</strong>.
          </p>
        </div>
      </Grid>
      <Grid item xs={12}>
        <Button
          primary
          label="Open Wallet"
          icon={<PlayCircle />}
          onClick={nextPage}
        />
      </Grid>
    </Grid>
  );
};

export default OpenWallet;