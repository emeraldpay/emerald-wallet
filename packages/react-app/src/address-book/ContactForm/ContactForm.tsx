import { BlockchainCode, Blockchains, IBlockchain, PersistentState, blockchainIdToCode } from '@emeraldwallet/core';
import { Button, ButtonGroup, ChainSelector, FormLabel, FormRow, Input, Page } from '@emeraldwallet/ui';
import { WithStyles, createStyles, withStyles } from '@material-ui/core';
import * as React from 'react';

export const styles = createStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'end',
    width: '100%',
  },
});

interface ContactData {
  address: string;
  blockchain: BlockchainCode;
  description?: string;
  id?: string;
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

class ContactForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { blockchains, contact } = props;

    const { address: contactAddress, blockchain: contactBlockchain, label } = contact ?? {};
    const { address } = contactAddress ?? {};

    const [blockchain] = blockchains;

    this.state = {
      address,
      label,
      blockchain:
        contactBlockchain == null
          ? blockchain == null
            ? BlockchainCode.ETH
            : blockchain.params.code
          : blockchainIdToCode(contactBlockchain),
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
        <FormRow>
          <FormLabel>Blockchain</FormLabel>
          {contact?.id == null ? (
            <ChainSelector blockchains={blockchains} initialValue={blockchain} onChange={this.handleBlockchainChange} />
          ) : (
            <>{Blockchains[blockchainIdToCode(contact.blockchain)].getTitle()}</>
          )}
        </FormRow>
        <FormRow>
          <FormLabel>Address</FormLabel>
          <Input disabled={contact?.id != null} type="text" value={address} onChange={this.handleAddressChange} />
        </FormRow>
        <FormRow>
          <FormLabel>Label</FormLabel>
          <Input type="text" value={label} onChange={this.handleLabelChange} />
        </FormRow>
        <FormRow last>
          <ButtonGroup classes={{ container: classes.buttons }}>
            <Button label="Cancel" onClick={this.handleCancel} />
            <Button primary={true} label="Save" onClick={this.handleSubmit} />
          </ButtonGroup>
        </FormRow>
      </Page>
    );
  }
}

export default withStyles(styles)(ContactForm);
