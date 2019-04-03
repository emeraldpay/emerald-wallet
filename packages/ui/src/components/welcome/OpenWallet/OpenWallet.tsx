import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '../../common/Button';
import { PlayCircle } from '@emeraldplatform/ui-icons';

import {ETC, ETH} from './Logos';
import * as CSS from 'csstype';

interface Props {
  connectETH: Function;
  connectETC: Function;
}

const styleLogo: CSS.Properties = {
  textAlign: "center",
  paddingTop: "24px"
};

const styleContent: CSS.Properties = {
  marginTop: "40px"
};

const styleHelp: CSS.Properties = {
  paddingTop: "40px"
};

const OpenWallet = ({ connectETC, connectETH }: Props) => {

  const selectETH = (
    <Card>
      <Grid container>
        <Grid item xs={8}>
          <CardContent style={styleContent}>
            <Typography component="p">
              Connect to Ethereum (ETH) blockchain
            </Typography>
          </CardContent>
          <Button
            // primary
            label="Ethereum"
            icon={<PlayCircle />}
            onClick={connectETH}
          />
        </Grid>
        <Grid item xs={4}>
          <div style={styleLogo}>
            <ETH size={110}/>
          </div>
        </Grid>
      </Grid>
    </Card>
  );

  const selectETC = (
    <Card>
      <Grid container>
        <Grid item xs={8}>
          <CardContent style={styleContent}>
            <Typography component="p">
              Connect to Ethereum Classic (ETC) blockchain
            </Typography>
          </CardContent>
          <Button
            // primary
            label="Ethereum Classic"
            icon={<PlayCircle />}
            onClick={connectETC}
          />
        </Grid>
        <Grid item xs={4}>
          <div style={styleLogo}>
            <ETC size={120}/>
          </div>
        </Grid>
      </Grid>
    </Card>
  );


  return (
    <Grid>
      <Grid container>
        <Grid item xs={12}>
          <Typography gutterBottom variant="h5" component="h2">
            Select a blockchain to connect
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={16}>
        <Grid item xs={6}>
          {selectETH}
        </Grid>
        <Grid item xs={6}>
          {selectETC}
        </Grid>
      </Grid>

      <Grid item xs={12} style={styleHelp}>
        <Typography component="p">
          You can always switch between blockchain by selecting them in top right corner of the application.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default OpenWallet;