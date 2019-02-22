import React from 'react';
import withStyles from 'react-jss';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CloseButton from 'components/common/CloseButton';
import AddToken from '../AddToken';
import TokensList from '../TokensList/list';

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#191919',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '24px',
    textTransform: 'uppercase',
  },
  closeButton: {
    float: 'right',
  },
  tokens: {
    marginTop: '5px',
    marginBottom: '5px',
  },
  addToken: {
    marginTop: '20px',
    marginBottom: '5px',
  },
};

export class TokensDialog extends React.Component {
  render() {
    const { onClose, classes } = this.props;

    return (
      <Dialog open={true} onClose={ onClose } >
        <DialogContent>
          <div className={ classes.header }>
            <div className={classes.title}>Add token by address</div>
            <div>
              <CloseButton className={ classes.closeButton } onClick={ onClose }/>
            </div>
          </div>
          <div>
            <div className={classes.tokens}>
              <TokensList/>
            </div>
            <div className={classes.addToken}>
              <AddToken/>
            </div>
          </div>
        </DialogContent>
      </Dialog>);
  }
}

export default withStyles(styles)(TokensDialog);
