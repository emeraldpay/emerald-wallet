import * as React from 'react';
import {withStyles} from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Button from '../../common/Button';
import { PlayCircle } from '@emeraldplatform/ui-icons';

import {ETC, ETH} from './Logos';
import * as CSS from 'csstype';

const styles = {
  card: {
    minHeight: '200px'
  }
};

interface Props {
  connectETH: Function;
  connectETC: Function;
  classes: any;
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

const OpenWallet = ({ connectETC, connectETH, classes }: Props) => {

  const selectETH = (
    <Card className={classes.card}>
      <Grid container>
        <Grid item xs={8}>
          <CardContent style={styleContent}>
            <Typography component="p">
              Connect to Ethereum (ETH) blockchain
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              // primary
              label="Ethereum"
              icon={<PlayCircle />}
              onClick={connectETH}
            />
          </CardActions>
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
    <Card className={classes.card}>
      <Grid container>
        <Grid item xs={8}>
          <CardContent style={styleContent}>
            <Typography component="p">
              Connect to Ethereum Classic (ETC) blockchain
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              // primary
              label="Ethereum Classic"
              icon={<PlayCircle />}
              onClick={connectETC}
            />
          </CardActions>
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
      <Grid container spacing={5}>
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

export default withStyles(styles)(OpenWallet);
