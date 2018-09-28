import React from 'react';
import { Dialog } from 'material-ui';
import CloseButton from 'elements/CloseButton';
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
    width: '15px',
    height: '15px',
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

export default class TokensDialog extends React.Component {
  render() {
    const { onClose } = this.props;

    return (
      <Dialog modal={true} open={true} onRequestClose={ onClose } contentStyle={{maxWidth: '600px'}}>
        <div style={{width: '100%'}}>
          <div style={ styles.header }>
            <div style={ styles.title }>Add token by address</div>
            <div>
              <CloseButton style={ styles.closeButton } onClick={ onClose }/>
            </div>
          </div>
          <div>
            <div style={ styles.tokens }>
              <TokensList/>
            </div>
            <div style={ styles.addToken }>
              <AddToken/>
            </div>
          </div>
        </div>
      </Dialog>);
  }
}
