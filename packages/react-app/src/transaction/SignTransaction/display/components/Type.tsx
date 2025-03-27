import { BlockchainCode, Blockchains, isBitcoin, workflow } from '@emeraldwallet/core';
import { BlockchainAvatar, FormLabel, FormRow } from '@emeraldwallet/ui';
import { Box, Typography } from '@mui/material';
import {
  blue as blueColors,
  green as greenColors,
  orange as orangeColors,
  red as redColors,
} from '@mui/material/colors';
import {
  Receipt as ApproveIcon,
  Cancel as CancelIcon,
  SwapVert as ConvertIcon,
  SettingsBackupRestore as RestoreIcon,
  Forward as SendIcon,
  Speed as SpeedupIcon,
  Help as UnknownIcon,
} from '@mui/icons-material';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()({
    blue: {
      color: blueColors[500],
    },
    green: {
      color: greenColors[500],
    },
    orange: {
      color: orangeColors[500],
    },
    red: {
      color: redColors[500],
    },
  }
);

interface OwnProps {
  blockchain: BlockchainCode;
  type: workflow.TxMetaType;
}

export const Type: React.FC<OwnProps> = ({ blockchain, type }) => {
  const styles = useStyles().classes;

  let typeIcon: React.ReactElement;
  let typeTitle: string;

  switch (type) {
    case workflow.TxMetaType.BITCOIN_CANCEL:
    case workflow.TxMetaType.ERC20_CANCEL:
    case workflow.TxMetaType.ETHER_CANCEL:
      typeIcon = <CancelIcon className={styles.red} />;
      typeTitle = 'Revoke';
      break;
    case workflow.TxMetaType.BITCOIN_SPEEDUP:
    case workflow.TxMetaType.ERC20_SPEEDUP:
    case workflow.TxMetaType.ETHER_SPEEDUP:
      typeIcon = <SpeedupIcon className={styles.orange} />;
      typeTitle = 'Speed up';
      break;
    case workflow.TxMetaType.BITCOIN_TRANSFER:
    case workflow.TxMetaType.ETHER_TRANSFER:
      typeIcon = <SendIcon className={styles.blue} />;
      typeTitle = `${isBitcoin(blockchain) ? 'Bitcoin' : 'Ether'} transfer`;
      break;
    case workflow.TxMetaType.ERC20_TRANSFER:
      typeIcon = <SendIcon className={styles.blue} />;
      typeTitle = 'Token Transfer';
      break;
    case workflow.TxMetaType.ERC20_APPROVE:
      typeIcon = <ApproveIcon className={styles.green} />;
      typeTitle = 'Allowance';
      break;
    case workflow.TxMetaType.ERC20_CONVERT:
      typeIcon = <ConvertIcon className={styles.green} />;
      typeTitle = 'Convert Ether';
      break;
    case workflow.TxMetaType.ERC20_RECOVERY:
    case workflow.TxMetaType.ETHER_RECOVERY:
      typeIcon = <RestoreIcon className={styles.green} />;
      typeTitle = 'Recovery';
      break;
    default:
      typeIcon = <UnknownIcon className={styles.orange} />;
      typeTitle = 'Unknown';
  }

  const blockchainTitle = Blockchains[blockchain].getTitle();

  return (
    <FormRow>
      <FormLabel>Type</FormLabel>
      <Box display="flex" alignItems="center" mr={2}>
        {typeIcon}
        <Box ml={1}>
          <Typography color="textPrimary">{typeTitle}</Typography>
        </Box>
      </Box>
      <Box display="flex" alignItems="center">
        <BlockchainAvatar blockchain={blockchain} size="small" />
        <Box ml={1}>
          <Typography color="textPrimary">{blockchainTitle}</Typography>
        </Box>
      </Box>
    </FormRow>
  );
};
