import { BigAmount, Unit } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  DEFAULT_GAS_LIMIT,
  EthereumTransaction,
  EthereumTransactionType,
  IBlockchain,
  TokenData,
  TokenRegistry,
  blockchainIdToCode,
  formatAmount,
  workflow,
} from '@emeraldwallet/core';
import {
  DefaultFee,
  FEE_KEYS,
  GasPrices,
  IState,
  SignData,
  accounts,
  application,
  screen,
  tokens,
  transaction,
} from '@emeraldwallet/store';
import { AccountSelect, Back, Button, ButtonGroup, FormLabel, FormRow, Page, PasswordInput } from '@emeraldwallet/ui';
import {
  Box,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Slider,
  Switch,
  TextField,
  createStyles,
  withStyles,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { connect } from 'react-redux';

const styles = createStyles({
  inputField: {
    flexGrow: 5,
  },
  gasPriceTypeBox: {
    width: '240px',
    float: 'left',
    height: '40px',
  },
  gasPriceSliderBox: {
    width: '300px',
    float: 'left',
  },
  gasPriceHelpBox: {
    width: '500px',
    clear: 'left',
  },
  gasPriceSlider: {
    width: '300px',
    marginBottom: '10px',
    paddingTop: '10px',
  },
  gasPriceHelp: {
    position: 'initial',
    paddingLeft: '10px',
  },
  gasPriceMarkLabel: {
    fontSize: '0.7em',
    opacity: 0.8,
  },
  gasPriceValueLabel: {
    fontSize: '0.7em',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'end',
    width: '100%',
  },
});

enum Stages {
  SETUP = 'setup',
  SIGN = 'sign',
}

interface OwnProps {
  entry: WalletEntry;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

interface StateProps {
  balanceByToken: Record<string, BigAmount>;
  defaultFee: DefaultFee;
  eip1559: boolean;
  ownAddresses: string[];
  recoverBlockchain: IBlockchain;
  tokensData: TokenData[];
  wrongBlockchain: IBlockchain;
  getBalancesByAddress(address: string): string[];
}

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  estimateGas(blockchain: BlockchainCode, tx: EthereumTransaction): Promise<number>;
  getFees(blockchain: BlockchainCode, defaultFee: DefaultFee): Promise<Record<typeof FEE_KEYS[number], GasPrices>>;
  goBack(): void;
  signTransaction(tx: workflow.CreateEthereumTx, password?: string): Promise<void>;
}

const minimalUnit = new Unit(9, '', undefined);

const CreateRecoverTransaction: React.FC<OwnProps & StylesProps & StateProps & DispatchProps> = ({
  entry: { address: fromAddress },
  defaultFee,
  eip1559,
  balanceByToken,
  classes,
  ownAddresses,
  recoverBlockchain,
  tokensData,
  wrongBlockchain,
  checkGlobalKey,
  estimateGas,
  getBalancesByAddress,
  getFees,
  goBack,
  signTransaction,
}) => {
  const [initializing, setInitializing] = useState(true);
  const [stage, setStage] = useState(Stages.SETUP);

  const [address, setAddress] = React.useState(ownAddresses[0]);
  const [token, setToken] = React.useState(tokensData[0]);

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();

  const [transaction, setTransaction] = React.useState(
    new workflow.CreateEthereumTx(null, wrongBlockchain.params.code).dump(),
  );

  const zeroWei = new Wei(0);

  const [stdMaxGasPrice, setStdMaxGasPrice] = React.useState(zeroWei);
  const [highMaxGasPrice, setHighMaxGasPrice] = React.useState(zeroWei);
  const [lowMaxGasPrice, setLowMaxGasPrice] = React.useState(zeroWei);

  const [stdPriorityGasPrice, setStdPriorityGasPrice] = React.useState(zeroWei);
  const [highPriorityGasPrice, setHighPriorityGasPrice] = React.useState(zeroWei);
  const [lowPriorityGasPrice, setLowPriorityGasPrice] = React.useState(zeroWei);

  const [gasPriceUnit, setGasPriceUnit] = useState(Wei.ZERO.units.base);

  const [maxGasPrice, setMaxGasPrice] = React.useState(0);
  const [useStdMaxGasPrice, setUseStdMaxGasPrice] = React.useState(true);

  const [priorityGasPrice, setPriorityGasPrice] = React.useState(0);
  const [useStdPriorityGasPrice, setUseStdPriorityGasPrice] = React.useState(true);

  const onTokenChange = React.useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      const tokenData = tokensData.find((item) => item.symbol === value);

      if (tokenData != null) {
        setToken(tokenData);
      }
    },
    [tokensData],
  );

  const onCreateTransaction = useCallback(async () => {
    if (fromAddress == null) {
      return;
    }

    const balance = new Wei(balanceByToken[token.symbol]);

    const tx = new workflow.CreateEthereumTx({
      amount: balance,
      blockchain: wrongBlockchain.params.code,
      from: fromAddress.value,
      gas: DEFAULT_GAS_LIMIT,
      to: address,
      target: workflow.TxTarget.SEND_ALL,
      type: eip1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY,
    });

    if (eip1559) {
      tx.maxGasPrice = new Wei(maxGasPrice, gasPriceUnit);
      tx.priorityGasPrice = new Wei(priorityGasPrice, gasPriceUnit);
    } else {
      tx.gasPrice = new Wei(maxGasPrice, gasPriceUnit);
    }

    tx.setTotalBalance(balance);

    tx.gas = await estimateGas(wrongBlockchain.params.code, tx.build());

    tx.rebalance();

    setTransaction(tx.dump());

    setStage(Stages.SIGN);
  }, [
    address,
    balanceByToken,
    eip1559,
    fromAddress,
    gasPriceUnit,
    maxGasPrice,
    priorityGasPrice,
    token.symbol,
    wrongBlockchain,
    estimateGas,
  ]);

  const onSignTransaction = useCallback(async () => {
    setPasswordError(undefined);

    const correctPassword = await checkGlobalKey(password);

    if (correctPassword) {
      const tx = workflow.CreateEthereumTx.fromPlain(transaction);

      await signTransaction(tx, password);
    } else {
      setPasswordError('Incorrect password');
    }
  }, [password, transaction, checkGlobalKey, signTransaction]);

  React.useEffect(
    () => {
      (async (): Promise<void> => {
        const fees = await getFees(recoverBlockchain.params.code, defaultFee);

        const { avgLast, avgMiddle, avgTail5 } = fees;

        const newStdMaxGasPrice = new Wei(avgTail5.max);
        const newStdPriorityGasPrice = new Wei(avgTail5.priority);

        setStdMaxGasPrice(newStdMaxGasPrice);
        setHighMaxGasPrice(new Wei(avgMiddle.max));
        setLowMaxGasPrice(new Wei(avgLast.max));

        setStdPriorityGasPrice(newStdPriorityGasPrice);
        setHighPriorityGasPrice(new Wei(avgMiddle.priority));
        setLowPriorityGasPrice(new Wei(avgLast.priority));

        const gasPriceOptimalUnit = newStdMaxGasPrice.getOptimalUnit(minimalUnit);
        const maxGasPriceNumber = newStdMaxGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber();
        const priorityGasPriceNumber = newStdPriorityGasPrice.getNumberByUnit(gasPriceOptimalUnit).toNumber();

        setGasPriceUnit(gasPriceOptimalUnit);

        setMaxGasPrice(maxGasPriceNumber);
        setPriorityGasPrice(priorityGasPriceNumber);

        setInitializing(false);
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const tx = workflow.CreateEthereumTx.fromPlain(transaction);

  const stdMaxGasPriceNumber = stdMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber();
  const highMaxGasPriceNumber = highMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber();
  const lowMaxGasPriceNumber = lowMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber();

  const stdPriorityGasPriceNumber = stdPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber();
  const highPriorityGasPriceNumber = highPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber();
  const lowPriorityGasPriceNumber = lowPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber();

  return (
    <Page title="Create Recover Transaction" leftIcon={<Back onClick={goBack} />}>
      {stage === Stages.SETUP && (
        <>
          {address == null ? (
            <Alert severity="warning">
              Address for recovery not found. Please add new address on {recoverBlockchain.getTitle()} blockchain and
              try again.
            </Alert>
          ) : (
            <>
              <FormRow>
                <FormLabel>Address</FormLabel>
                {ownAddresses.length === 1 ? (
                  <>{address}</>
                ) : (
                  <AccountSelect
                    accounts={ownAddresses}
                    selectedAccount={address}
                    getBalancesByAddress={getBalancesByAddress}
                    onChange={setAddress}
                  />
                )}
              </FormRow>
              {tokensData.length > 1 && (
                <FormRow>
                  <FormLabel>Token</FormLabel>
                  <TextField select value={token.symbol} onChange={onTokenChange}>
                    {tokensData.map((item) => (
                      <MenuItem key={item.symbol} value={item.symbol}>
                        {item.symbol}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormRow>
              )}
              <FormRow>
                <FormLabel>Amount</FormLabel>
                {formatAmount(balanceByToken[token.symbol])}
              </FormRow>
              <FormRow>
                <FormLabel>Reason</FormLabel>
                {recoverBlockchain.getTitle()} coins/tokens on {wrongBlockchain.getTitle()} address
              </FormRow>
              <FormRow>
                <FormLabel top>{eip1559 ? 'Max gas price' : 'Gas price'}</FormLabel>
                <Box className={classes.inputField}>
                  <Box className={classes.gasPriceTypeBox}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useStdMaxGasPrice}
                          color="primary"
                          disabled={initializing}
                          onChange={(event): void => {
                            const checked = event.target.checked;

                            setUseStdMaxGasPrice(checked);

                            if (checked) {
                              setMaxGasPrice(stdMaxGasPriceNumber);
                            }
                          }}
                        />
                      }
                      label={useStdMaxGasPrice ? 'Standard Price' : 'Custom Price'}
                    />
                  </Box>
                  {!useStdMaxGasPrice && (
                    <Box className={classes.gasPriceSliderBox}>
                      <Slider
                        aria-labelledby="discrete-slider"
                        classes={{
                          markLabel: classes.gasPriceMarkLabel,
                          valueLabel: classes.gasPriceValueLabel,
                        }}
                        className={classes.gasPriceSlider}
                        defaultValue={stdMaxGasPriceNumber}
                        marks={[
                          { value: lowMaxGasPriceNumber, label: 'Slow' },
                          { value: highMaxGasPriceNumber, label: 'Urgent' },
                        ]}
                        max={highMaxGasPriceNumber}
                        min={lowMaxGasPriceNumber}
                        step={0.01}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value): string => value.toFixed(2)}
                        getAriaValueText={(): string => `${maxGasPrice.toFixed(2)} ${gasPriceUnit.toString()}`}
                        onChange={(event, value): void => setMaxGasPrice(value as number)}
                      />
                    </Box>
                  )}
                  <Box className={classes.gasPriceHelpBox}>
                    <FormHelperText className={classes.gasPriceHelp}>
                      {maxGasPrice.toFixed(2)} {gasPriceUnit.toString()}
                    </FormHelperText>
                  </Box>
                </Box>
              </FormRow>
              {eip1559 && (
                <FormRow>
                  <FormLabel top>Priority gas price</FormLabel>
                  <Box className={classes.inputField}>
                    <Box className={classes.gasPriceTypeBox}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={useStdPriorityGasPrice}
                            color="primary"
                            disabled={initializing}
                            onChange={(event): void => {
                              const checked = event.target.checked;

                              if (checked) {
                                setPriorityGasPrice(stdPriorityGasPriceNumber);
                              }

                              setUseStdPriorityGasPrice(checked);
                            }}
                          />
                        }
                        label={useStdPriorityGasPrice ? 'Standard Price' : 'Custom Price'}
                      />
                    </Box>
                    {!useStdPriorityGasPrice && (
                      <Box className={classes.gasPriceSliderBox}>
                        <Slider
                          aria-labelledby="discrete-slider"
                          classes={{
                            markLabel: classes.gasPriceMarkLabel,
                            valueLabel: classes.gasPriceValueLabel,
                          }}
                          className={classes.gasPriceSlider}
                          defaultValue={stdPriorityGasPriceNumber}
                          marks={[
                            { value: lowPriorityGasPriceNumber, label: 'Slow' },
                            { value: highPriorityGasPriceNumber, label: 'Urgent' },
                          ]}
                          max={highPriorityGasPriceNumber}
                          min={lowPriorityGasPriceNumber}
                          step={0.01}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value): string => value.toFixed(2)}
                          getAriaValueText={(): string => `${priorityGasPrice.toFixed(2)} ${gasPriceUnit.toString()}`}
                          onChange={(event, value): void => setPriorityGasPrice(value as number)}
                        />
                      </Box>
                    )}
                    <Box className={classes.gasPriceHelpBox}>
                      <FormHelperText className={classes.gasPriceHelp}>
                        {priorityGasPrice.toFixed(2)} {gasPriceUnit.toString()}
                      </FormHelperText>
                    </Box>
                  </Box>
                </FormRow>
              )}
              <FormRow>
                <FormLabel />
                <ButtonGroup classes={{ container: classes.buttons }}>
                  {initializing && (
                    <Button
                      disabled
                      icon={<CircularProgress size={16} />}
                      label="Checking the network"
                      variant="text"
                    />
                  )}
                  <Button label="Cancel" onClick={goBack} />
                  <Button primary disabled={initializing} label="Create Transaction" onClick={onCreateTransaction} />
                </ButtonGroup>
              </FormRow>
            </>
          )}
        </>
      )}
      {stage === Stages.SIGN && (
        <>
          <FormRow>
            <FormLabel />
            Recover {formatAmount(tx.getAmount(), 6)} with fee {formatAmount(tx.getFees(), 6)}
          </FormRow>
          <FormRow>
            <FormLabel>Password</FormLabel>
            <PasswordInput error={passwordError} onChange={setPassword} />
          </FormRow>
          <FormRow last>
            <FormLabel />
            <ButtonGroup classes={{ container: classes.buttons }}>
              <Button label="Cancel" onClick={goBack} />
              <Button
                label="Sign Transaction"
                disabled={password.length === 0}
                primary={true}
                onClick={onSignTransaction}
              />
            </ButtonGroup>
          </FormRow>
        </>
      )}
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const { entry } = ownProps;

    const recoverBlockchainCode = blockchainIdToCode(entry.blockchain);
    const recoverBlockchain = Blockchains[recoverBlockchainCode];

    const wrongBlockchainCode = recoverBlockchainCode === BlockchainCode.ETC ? BlockchainCode.ETH : BlockchainCode.ETC;
    const wrongBlockchain = Blockchains[wrongBlockchainCode];

    const zeroAmount = accounts.selectors.zeroAmountFor(recoverBlockchainCode);
    const balance = accounts.selectors.getBalance(state, entry.id, zeroAmount) ?? zeroAmount;

    let entryTokenBalances: BigAmount[] = [];

    if (entry.address != null) {
      entryTokenBalances = tokens.selectors.selectBalances(state, recoverBlockchainCode, entry.address?.value) ?? [];
    }

    const balanceByToken = entryTokenBalances.reduce(
      (carry, balance) => ({ ...carry, [balance.units.base.code]: balance }),
      {
        [recoverBlockchain.params.coinTicker]: balance,
      },
    );

    const uniqueAddresses =
      accounts.selectors
        .findWalletByEntryId(state, entry.id)
        ?.entries.reduce<Set<string>>(
          (carry, item) =>
            item.blockchain === entry.blockchain && item.address != null ? carry.add(item.address.value) : carry,
          new Set(),
        ) ?? new Set();

    const tokenRegistry = new TokenRegistry(state.application.tokens);

    const tokensUnit = entryTokenBalances.filter((balance) => balance.isPositive()).map(({ units }) => units.base.code);
    const tokensData =
      tokenRegistry.byBlockchain(recoverBlockchainCode)?.filter(({ symbol }) => tokensUnit.includes(symbol)) ?? [];

    return {
      balanceByToken,
      recoverBlockchain,
      wrongBlockchain,
      defaultFee: application.selectors.getDefaultFee(state, recoverBlockchainCode),
      eip1559: recoverBlockchain.params.eip1559 ?? false,
      ownAddresses: [...uniqueAddresses],
      tokensData: [
        ...tokensData,
        {
          address: '',
          symbol: recoverBlockchain.params.coinTicker,
          decimals: recoverBlockchain.params.decimals,
        } as TokenData,
      ],
      getBalancesByAddress(address) {
        const entryByAddress = accounts.selectors.findAccountByAddress(state, address, recoverBlockchainCode);

        if (entryByAddress == null || !isEthereumEntry(entryByAddress)) {
          return [];
        }

        const balance = accounts.selectors.getBalance(state, entryByAddress.id, zeroAmount) ?? zeroAmount;

        return [formatAmount(balance)];
      },
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    estimateGas(blockchain, tx) {
      return dispatch(transaction.actions.estimateGas(blockchain, tx));
    },
    getFees(blockchain, defaultFee) {
      return dispatch(transaction.actions.getFee(blockchain, defaultFee));
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    async signTransaction(tx, password) {
      if (tx.from == null || tx.to == null) {
        return;
      }

      const signed: SignData | undefined = await dispatch(
        transaction.actions.signTransaction(ownProps.entry.id, tx.build(), password),
      );

      if (signed != null) {
        dispatch(
          screen.actions.gotoScreen(
            screen.Pages.BROADCAST_TX,
            {
              ...signed,
              fee: (tx.maxGasPrice ?? tx.gasPrice ?? Wei.ZERO).multiply(tx.gas),
              originalAmount: tx.amount,
            },
            null,
            true,
          ),
        );
      }
    },
  }),
)(withStyles(styles)(CreateRecoverTransaction));
