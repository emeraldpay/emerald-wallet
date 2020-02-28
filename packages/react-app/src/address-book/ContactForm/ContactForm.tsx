import { ButtonGroup, Input, Page } from '@emeraldplatform/ui';
import { BlockchainCode } from '@emeraldwallet/core';
import { Button, ChainSelector } from '@emeraldwallet/ui';
import { CSSProperties, withStyles } from '@material-ui/styles';
import * as React from 'react';

export const styles = {
  formRow: {
    display: 'flex',
    marginBottom: '19px',
    alignItems: 'center'
  },
  left: {
    flexBasis: '20%',
    marginLeft: '14.75px',
    marginRight: '14.75px'
  },
  right: {
    flexGrow: 2,
    display: 'flex',
    alignItems: 'center',
    marginLeft: '14.75px',
    marginRight: '14.75px',
    maxWidth: '580px'
  },
  fieldName: {
    fontSize: '16px',
    textAlign: 'right'
  } as CSSProperties
};

export interface IContactFormProps {
  classes: any;
  initialValues?: {
    name?: string;
    address?: string;
  };
  blockAddress?: boolean;
  onCancel?: any;
  onSubmit?: any;
  title?: string;
  blockchains?: any;
}

interface IContactFormState {
  name?: string;
  address?: string;
  blockchain?: BlockchainCode;
}

export class ContactForm extends React.Component<IContactFormProps, IContactFormState> {
  constructor (props: IContactFormProps) {
    super(props);
    this.state = {
      ...this.props.initialValues,
      blockchain: (props.blockchains && props.blockchains.length > 0) ? props.blockchains[0].params.code : BlockchainCode.ETH
    };
  }

  public handleCancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  public handleSubmit = () => {
    if (this.props.onSubmit) {
      const { address, name, blockchain } = this.state;
      this.props.onSubmit({ blockchain, address, name, description: '' });
    }
  }

  public handleAddressChange = (event: any) => {
    this.setState({
      address: event.target.value
    });
  }

  public handleChainChange = (chain: any) => {
    this.setState({
      blockchain: chain
    });
  }

  public handleNameChange = (event: any) => {
    this.setState({
      name: event.target.value
    });
  }

  public render () {
    const {
      blockAddress, title, classes
    } = this.props;
    const {
      blockchain, name, address
    } = this.state;
    const chains = this.props.blockchains || [];
    return (
      <Page title={title || ''}>
        <div className={classes.formRow}>
          <div className={classes.left}>
            <div className={classes.fieldName}>
              Blockchain
            </div>
          </div>
          <div className={classes.right}>
            <ChainSelector
              onChange={this.handleChainChange}
              value={blockchain}
              chains={chains}
            />
          </div>
        </div>
        <div className={classes.formRow}>
          <div className={classes.left}>
            <div className={classes.fieldName}>Address</div>
          </div>
          <div className={classes.right}>
            <Input
              onChange={this.handleAddressChange}
              value={address}
              type='text'
              disabled={blockAddress}
            />
          </div>
        </div>
        <div className={classes.formRow}>
          <div className={classes.left}>
            <div className={classes.fieldName}>Name</div>
          </div>
          <div className={classes.right}>
            <Input
              onChange={this.handleNameChange}
              value={name}
              type='text'
            />
          </div>
        </div>

        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <ButtonGroup>
              <Button
                label='Cancel'
                onClick={this.handleCancel}
              />
              <Button
                primary={true}
                label='Save'
                onClick={this.handleSubmit}
              />
            </ButtonGroup>
          </div>
        </div>
      </Page>
    );
  }
}

export default withStyles(styles)(ContactForm);
