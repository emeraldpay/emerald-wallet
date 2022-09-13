import { BlockchainCode, Blockchains, IBlockchain, PersistentState, blockchainIdToCode } from '@emeraldwallet/core';
import { Button, ButtonGroup, ChainSelector, Input, Page } from '@emeraldwallet/ui';
import { StyleRules, Theme, createStyles } from '@material-ui/core';
import { WithStyles, withStyles } from '@material-ui/styles';
import * as React from 'react';

export const styles = (theme: Theme): StyleRules =>
  createStyles({
    row: {
      alignItems: 'center',
      display: 'flex',
      marginBottom: 20,
    },
    leftColumn: {
      flex: '1 1 20%',
      marginRight: 20,
    },
    rightColumn: {
      alignItems: 'center',
      display: 'flex',
      flex: '1 1 80%',
    },
    label: {
      color: theme.palette.text.secondary,
      fontSize: 16,
      textAlign: 'right',
    },
  });

interface ContactData {
  id?: string;
  address: string;
  blockchain: BlockchainCode;
  description?: string;
  label?: string;
}

export interface OwnProps {
  contact?: PersistentState.AddressbookItem;
}

export interface StateProps {
  blockchains: IBlockchain[];
  title: string;
}

export interface DispatchProps {
  onCancel(): void;
  onSubmit(data: ContactData): void;
}

type Props = OwnProps & StateProps & DispatchProps & WithStyles<typeof styles>;
type State = Partial<ContactData>;

export class ContactForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { blockchains, contact } = props;

    const { address: contactAddress, blockchain, label } = contact ?? {};
    const { address } = contactAddress ?? {};

    this.state = {
      address,
      label,
      blockchain:
        blockchain == null
          ? blockchains.length > 0
            ? blockchains[0].params.code
            : BlockchainCode.ETH
          : blockchainIdToCode(blockchain),
    };
  }

  public handleBlockchainChange = (blockchain: BlockchainCode): void => {
    this.setState({ blockchain });
  };

  public handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ address: event.target.value });
  };

  public handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ label: event.target.value });
  };

  public handleSubmit = (): void => {
    const { contact } = this.props;
    const { address, blockchain, description, label } = this.state;

    if (address != null && blockchain != null) {
      this.props.onSubmit({ address, blockchain, description, label, id: contact?.id });
    }
  };

  public handleCancel = (): void => {
    this.props.onCancel();
  };

  public render(): React.ReactElement {
    const { blockchains = [], classes, contact, title } = this.props;
    const { address, blockchain, label } = this.state;

    return (
      <Page title={title}>
        <div className={classes.row}>
          <div className={classes.leftColumn}>
            <div className={classes.label}>Blockchain</div>
          </div>
          <div className={classes.rightColumn}>
            {contact?.id == null ? (
              <ChainSelector chains={blockchains} value={blockchain} onChange={this.handleBlockchainChange} />
            ) : (
              <>{Blockchains[blockchainIdToCode(contact.blockchain)].getTitle()}</>
            )}
          </div>
        </div>
        <div className={classes.row}>
          <div className={classes.leftColumn}>
            <div className={classes.label}>Address</div>
          </div>
          <div className={classes.rightColumn}>
            <Input disabled={contact?.id != null} type="text" value={address} onChange={this.handleAddressChange} />
          </div>
        </div>
        <div className={classes.row}>
          <div className={classes.leftColumn}>
            <div className={classes.label}>Label</div>
          </div>
          <div className={classes.rightColumn}>
            <Input type="text" value={label} onChange={this.handleLabelChange} />
          </div>
        </div>
        <div className={classes.row}>
          <div className={classes.leftColumn} />
          <div className={classes.rightColumn}>
            <ButtonGroup>
              <Button label="Cancel" onClick={this.handleCancel} />
              <Button primary={true} label="Save" onClick={this.handleSubmit} />
            </ButtonGroup>
          </div>
        </div>
      </Page>
    );
  }
}

export default withStyles(styles)(ContactForm);
