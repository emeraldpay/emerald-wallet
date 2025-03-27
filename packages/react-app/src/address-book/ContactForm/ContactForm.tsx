import { BlockchainCode, Blockchains, IBlockchain, PersistentState, blockchainIdToCode } from '@emeraldwallet/core';
import { Button, ButtonGroup, ChainSelector, FormLabel, FormRow, Input, Page } from '@emeraldwallet/ui';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

const useStyles = makeStyles()({
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

type Props = OwnProps & StateProps & DispatchProps;

const ContactForm: React.FC<Props> = ({ blockchains = [], contact, onCancel, onSubmit, title }) => {
  const { classes } = useStyles();

  // Initialize state from props
  const { address: contactAddress, blockchain: contactBlockchain, label: contactLabel } = contact ?? {};
  const { address: initialAddress } = contactAddress ?? {};
  const [firstBlockchain] = blockchains;

  const initialBlockchain = contactBlockchain == null
    ? firstBlockchain == null
      ? BlockchainCode.ETH
      : firstBlockchain.params.code
    : blockchainIdToCode(contactBlockchain);

  // State hooks
  const [address, setAddress] = React.useState<string | undefined>(initialAddress);
  const [blockchain, setBlockchain] = React.useState<BlockchainCode | undefined>(initialBlockchain);
  const [label, setLabel] = React.useState<string | undefined>(contactLabel);
  const [description, setDescription] = React.useState<string | undefined>(undefined);

  // Event handlers
  const handleBlockchainChange = (newBlockchain: BlockchainCode): void => {
    setBlockchain(newBlockchain);
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAddress(event.target.value);
  };

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setLabel(event.target.value);
  };

  const handleSubmit = (): void => {
    if (address != null && blockchain != null) {
      onSubmit({ address, blockchain, description, label, id: contact?.id });
    }
  };

  const handleCancel = (): void => {
    onCancel();
  };

  return (
    <Page title={title}>
      <FormRow>
        <FormLabel>Blockchain</FormLabel>
        {contact?.id == null ? (
          <ChainSelector blockchains={blockchains} initialValue={blockchain} onChange={handleBlockchainChange} />
        ) : (
          <>{Blockchains[blockchainIdToCode(contact.blockchain)].getTitle()}</>
        )}
      </FormRow>
      <FormRow>
        <FormLabel>Address</FormLabel>
        <Input disabled={contact?.id != null} type="text" value={address} onChange={handleAddressChange} />
      </FormRow>
      <FormRow>
        <FormLabel>Label</FormLabel>
        <Input type="text" value={label} onChange={handleLabelChange} />
      </FormRow>
      <FormRow last>
        <ButtonGroup classes={{ container: classes.buttons }}>
          <Button label="Cancel" onClick={handleCancel} />
          <Button primary={true} label="Save" onClick={handleSubmit} />
        </ButtonGroup>
      </FormRow>
    </Page>
  );
};

export default ContactForm;
