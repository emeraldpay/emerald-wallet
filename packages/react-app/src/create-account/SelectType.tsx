import {
  Avatar, Divider,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemAvatar, ListItemText,
  Radio,
  RadioGroup, SvgIcon,
  Typography
} from "@material-ui/core";
import {
  Download as DownloadIcon,
  Key as KeyIcon,
  Keypair as KeypairIcon,
  Ledger as LedgerIcon,
} from '@emeraldplatform/ui-icons';
import {connect} from "react-redux";
import {addAccount, settings, State} from "@emeraldwallet/store";
import * as React from "react";
import {AddType} from "@emeraldwallet/store/lib/add-account";
import ListItemIcon from "@material-ui/core/ListItemIcon";

type TypeDef = {
  code: addAccount.AddType,
  title: string,
  description: string
}

const ETHEREUM_TYPES: TypeDef[] = [
  {
    code: AddType.GENERATE_PK,
    title: "Generate Private Key",
    description: "Generate a new Private Key"
  },
  {
    code: AddType.IMPORT_PK,
    title: "Import Private Key",
    description: "Import an existing raw unencrypted Private Key"
  },
  {
    code: AddType.IMPORT_JSON,
    title: "Import JSON",
    description: "Import existing Private Key from JSON file"
  },
  //TODO only if wallet has an associated Seed
  // {
  //   code: AddType.SEED_PATH,
  //   title: "Select HD Path",
  //   description: "Select a new address from associated Seed or Hardware Key"
  // },
];

type OwnProps = {
}

type RenderProps = {
  supportedTypes: TypeDef[],
  type?: addAccount.AddType
}

type DispatchProps = {
  selectType: (type?: addAccount.AddType) => void;
}

function icon(type: AddType): JSX.Element {
  if (type === addAccount.AddType.GENERATE_PK) {
    return <KeypairIcon />
  }
  if (type === addAccount.AddType.IMPORT_PK) {
    return <KeyIcon />
  }
  if (type === addAccount.AddType.IMPORT_JSON) {
    return <DownloadIcon />
  }
  if (type === addAccount.AddType.SEED_PATH) {
    return <LedgerIcon />
  }
  return <KeypairIcon />
}

const SelectType = ((props: RenderProps & DispatchProps) => {
  const {supportedTypes, type} = props;
  const {selectType} = props;

  return (
    <Grid container={true}>
      <Grid item={true} xs={12}>
        <List>
          {supportedTypes.map((b,i) =>
            <div key={b.code}>
              {i > 0 ? <Divider variant="inset" component="li" /> : null}
              <ListItem
                alignItems="flex-start"
                button={true}
                selected={b.code === type}
                onClick={() => selectType(b.code)}
              >
                <ListItemAvatar>
                  <ListItemIcon>
                    {icon(b.code)}
                  </ListItemIcon>
                </ListItemAvatar>
                <ListItemText
                  primary={b.title}
                  secondary={b.description}
                />
              </ListItem>
            </div>
          )}
        </List>
      </Grid>
    </Grid>
  )
});

export default connect<RenderProps, DispatchProps, OwnProps, State>(
  (state, ownProps) => {
    return {
      supportedTypes: ETHEREUM_TYPES,
      type: state.addAccount!!.type
    }
  },
  (dispatch, ownProps) => {
    return {
      selectType: (type?: addAccount.AddType) => {
        dispatch(addAccount.actions.setType(type));
        dispatch(addAccount.actions.nextPage());
      }
    }
  }
)((SelectType));