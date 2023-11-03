import { BigAmount } from '@emeraldpay/bigamount';
import {
  BlockchainCode,
  Blockchains,
  DecodedInput,
  EthereumTx,
  MAX_DISPLAY_ALLOWANCE,
  TokenRegistry,
  amountFactory,
  decodeData,
  formatAmountPartial,
  toNumber,
} from '@emeraldwallet/core';
import { Account, FormLabel, FormRow } from '@emeraldwallet/ui';
import { Tooltip, Typography, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    amount: {
      display: 'inline-block',
      maxWidth: 120,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      verticalAlign: 'bottom',
    },
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
    tooltip: {
      cursor: 'help',
    },
  }),
);

interface OwnProps {
  blockchain: BlockchainCode;
  raw: string;
  tokenRegistry: TokenRegistry;
}

export const EthereumDecoded: React.FC<OwnProps> = ({ blockchain, raw, tokenRegistry }) => {
  const styles = useStyles();

  const decoded = React.useMemo(() => {
    const { chainId } = Blockchains[blockchain].params;

    const tx = EthereumTx.fromRaw(raw, chainId);

    const data = tx.getData();
    const from = tx.getSenderAddress().toString();
    const nonce = tx.getNonce();

    let amount: BigAmount = amountFactory(blockchain)(toNumber(tx.getValue()));
    let to = tx.getRecipientAddress().toString();

    let owner: string | undefined;
    let method: string | undefined;

    if (data.length > 0) {
      const decodedData = decodeData(data);

      method = decodedData.name;

      if (decodedData.inputs.length > 1 && tokenRegistry.hasAddress(blockchain, to)) {
        let dataFrom: DecodedInput | undefined;
        let dataTo: DecodedInput | undefined;
        let dataAmount: DecodedInput | undefined;

        switch (method) {
          case 'approve':
          case 'transfer': {
            [dataTo, dataAmount] = decodedData.inputs;

            break;
          }
          case 'transferFrom': {
            [dataFrom, dataTo, dataAmount] = decodedData.inputs;
          }
        }

        if (dataTo != null && dataAmount != null) {
          const tokenData = tokenRegistry.byAddress(blockchain, to);

          amount = tokenData.getAmount(dataAmount);
          owner = dataFrom?.toString(16);
          to = dataTo.toString(16);
        }
      }
    }

    return { amount, from, method, nonce, owner, to };
  }, [blockchain, raw, tokenRegistry]);

  const [amountValue, amountUnit] = formatAmountPartial(decoded.amount);

  return (
    <>
      <FormRow>
        <FormLabel>From</FormLabel>
        <Account identity={true} address={decoded.from} />
      </FormRow>
      {decoded.owner != null && (
        <FormRow>
          <FormLabel>Owner</FormLabel>
          <Account identity={true} address={decoded.owner} />
        </FormRow>
      )}
      <FormRow>
        <FormLabel>To</FormLabel>
        <Account identity={true} address={decoded.to} />
      </FormRow>
      {decoded.method === 'approve' ? (
        <FormRow>
          <FormLabel>Approving</FormLabel>
          <Typography>
            <Tooltip className={styles.tooltip} title={decoded.amount.toString()}>
              {decoded.amount.number.isGreaterThanOrEqualTo(MAX_DISPLAY_ALLOWANCE) ? (
                <span>&infin;</span>
              ) : (
                <span className={styles.amount}>{amountValue}</span>
              )}
            </Tooltip>{' '}
            {amountUnit}
          </Typography>
        </FormRow>
      ) : (
        <FormRow>
          <FormLabel>Amount</FormLabel>
          <Typography>
            {amountValue} {amountUnit}
          </Typography>
        </FormRow>
      )}
      <FormRow>
        <FormLabel>Nonce</FormLabel>
        <Typography>{decoded.nonce}</Typography>
      </FormRow>
    </>
  );
};
