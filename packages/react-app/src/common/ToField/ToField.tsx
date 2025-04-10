import { BlockchainCode, Blockchains, PersistentState } from '@emeraldwallet/core';
import { IState, addressBook, blockchains } from '@emeraldwallet/store';
import { Input } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import AddressBookMenu from './AddressBookMenu';

interface OwnProps {
  blockchain: BlockchainCode;
  disabled?: boolean;
  to?: string;
  onChange(value: string | undefined): void;
}

interface StateProps {
  contacts: PersistentState.AddressbookItem[];
}

interface DispatchProps {
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
  resolveName(blockchain: BlockchainCode, name: string): Promise<string | null>;
}

interface State {
  error: string | null;
  hint: string | null;
  value: string;
}

type Props = OwnProps & StateProps & DispatchProps;

const ToField: React.FC<Props> = (props) => {
  const { contacts, disabled, blockchain, onChange, lookupAddress, resolveName, to } = props;
  
  const [state, setState] = React.useState<State>({
    error: null,
    hint: null,
    value: to ?? '',
  });
  
  const mountedRef = React.useRef(true);
  
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  const getRightIcon = (): React.ReactNode => {
    if (disabled === true) {
      return null;
    }

    return <AddressBookMenu contacts={contacts} onChange={(value) => handleChange(value)} />;
  };

  const handleChange = async (value: string): Promise<void> => {
    setState({ ...state, value, error: null, hint: null });

    const { isValidAddress } = Blockchains[blockchain];

    const to = value.trim();

    if (blockchain === BlockchainCode.ETH || blockchain === BlockchainCode.Sepolia) {
      if (/\.eth$/.test(to)) {
        onChange(undefined);

        const address = await resolveName(blockchain, to);

        if (mountedRef.current) {
          if (address == null) {
            setState(prev => ({ ...prev, error: 'Name not found' }));
          } else {
            onChange(address);
            setState(prev => ({ ...prev, hint: address }));
          }
        }
      } else {
        onChange(to);

        if (to.length === 0) {
          setState(prev => ({ ...prev, error: 'Required' }));
        } else if (isValidAddress(to)) {
          const name = await lookupAddress(blockchain, to);

          if (mountedRef.current && name != null) {
            setState(prev => ({ ...prev, hint: name }));
          }
        } else {
          setState(prev => ({ ...prev, error: 'Incorrect address format' }));
        }
      }
    } else {
      onChange(to);

      if (to.length === 0) {
        setState(prev => ({ ...prev, error: 'Required' }));
      } else if (!isValidAddress(to)) {
        setState(prev => ({ ...prev, error: 'Incorrect address format' }));
      }
    }
  };

  const { error, hint, value } = state;

  return (
    <Input
      errorText={error}
      disabled={disabled}
      hintText={hint}
      rightIcon={getRightIcon()}
      value={value}
      onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => handleChange(value)}
    />
  );
}

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => ({
    contacts: addressBook.selectors.byBlockchain(state, ownProps.blockchain),
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    lookupAddress(blockchain, address) {
      return dispatch(blockchains.actions.lookupAddress(blockchain, address));
    },
    resolveName(blockchain, name) {
      return dispatch(blockchains.actions.resolveName(blockchain, name));
    },
  }),
)(ToField);
