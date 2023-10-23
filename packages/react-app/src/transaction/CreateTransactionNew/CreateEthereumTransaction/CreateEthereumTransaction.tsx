import { BigAmount } from '@emeraldpay/bigamount';
import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { Blockchains, CurrencyAmount, TokenRegistry, amountFactory, blockchainIdToCode } from '@emeraldwallet/core';
import { CreateTxStage, IState, TokenBalanceBelong, accounts, settings, tokens, txStash } from '@emeraldwallet/store';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import { Asset, SelectAsset } from '../../../common/SelectAsset';
import { BroadcastTransaction } from './BroadcastTransaction';
import { SetupTransaction } from './SetupTransaction';
import { SignTransaction } from './SignTransaction';

interface OwnProps {
  entry: EthereumEntry;
  ownerAddress?: string;
  onCancel(): void;
}

interface StateProps {
  asset: string;
  assets: Asset[];
  stage: CreateTxStage;
  getBalance(entry: EthereumEntry, asset: string, ownerAddress?: string): BigAmount;
  getFiatBalance(asset: string): CurrencyAmount | undefined;
}

interface DispatchProps {
  setAsset(asset: string): void;
}

const CreateEthereumTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  asset,
  assets,
  entry,
  ownerAddress,
  stage,
  getBalance,
  getFiatBalance,
  onCancel,
  setAsset,
}) => (
  <>
    {stage === CreateTxStage.SETUP && (
      <>
        <FormRow>
          <FormLabel>Token</FormLabel>
          <SelectAsset
            asset={asset}
            assets={assets}
            balance={getBalance(entry, asset, ownerAddress)}
            fiatBalance={getFiatBalance(asset)}
            onChangeAsset={setAsset}
          />
        </FormRow>
        <SetupTransaction
          asset={asset}
          entry={entry}
          ownerAddress={ownerAddress}
          getBalance={getBalance}
          onCancel={onCancel}
        />
      </>
    )}
    {stage === CreateTxStage.SIGN && <SignTransaction entry={entry} onCancel={onCancel} />}
    {stage === CreateTxStage.BROADCAST && <BroadcastTransaction entry={entry} onCancel={onCancel} />}
  </>
);

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { entry, ownerAddress }) => {
    const tokenRegistry = new TokenRegistry(state.application.tokens);

    const getBalance = (entry: EthereumEntry, asset: string, ownerAddress?: string): BigAmount => {
      const blockchain = blockchainIdToCode(entry.blockchain);

      if (tokenRegistry.hasAddress(blockchain, asset)) {
        const token = tokenRegistry.byAddress(blockchain, asset);
        const tokenZeroAmount = token.getAmount(0);

        if (entry.address == null) {
          return tokenZeroAmount;
        }

        return (
          tokens.selectors.selectBalance(state, blockchain, entry.address.value, token.address, {
            belonging: ownerAddress == null ? TokenBalanceBelong.OWN : TokenBalanceBelong.ALLOWED,
            belongsTo: ownerAddress,
          }) ?? tokenZeroAmount
        );
      }

      return accounts.selectors.getBalance(state, entry.id, amountFactory(blockchain)(0));
    };

    const blockchain = blockchainIdToCode(entry.blockchain);

    const tokenAssets = tokenRegistry.byBlockchain(blockchain).reduce<Asset[]>((carry, { address, symbol }) => {
      const balance = getBalance(entry, address, ownerAddress);

      if (balance.isPositive()) {
        return [...carry, { address, balance, symbol }];
      }

      return carry;
    }, []);

    const { coinTicker } = Blockchains[blockchain].params;

    const assets = [{ balance: getBalance(entry, coinTicker), symbol: coinTicker }, ...tokenAssets];

    let asset = txStash.selectors.getAsset(state) ?? coinTicker;

    if (assets.find(({ address, symbol }) => address === asset || symbol === asset) == null) {
      const [{ address, symbol }] = assets;

      asset = address ?? symbol;
    }

    return {
      asset,
      assets,
      stage: txStash.selectors.getStage(state),
      getBalance,
      getFiatBalance(asset) {
        const balance = getBalance(entry, asset);

        const rate = settings.selectors.fiatRate(state, balance);

        if (rate == null) {
          return undefined;
        }

        return CurrencyAmount.create(
          balance.getNumberByUnit(balance.units.top).multipliedBy(rate).toNumber(),
          settings.selectors.fiatCurrency(state),
        );
      },
    };
  },
  (dispatch) => ({
    setAsset(asset) {
      dispatch(txStash.actions.setAsset(asset));
    },
  }),
)(CreateEthereumTransaction);
