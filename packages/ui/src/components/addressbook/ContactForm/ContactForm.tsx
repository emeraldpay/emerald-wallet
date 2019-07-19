import * as React from 'react';
import {CSSProperties, withStyles} from '@material-ui/styles';
import {Page, ButtonGroup, Input} from '@emeraldplatform/ui';
import Button from '../../common/Button';
import ChainSelector from "../../common/ChainSelector";

export const styles = {
  formRow: {
    display: 'flex',
    marginBottom: '19px',
    alignItems: 'center',
  },
  left: {
    flexBasis: '20%',
    marginLeft: '14.75px',
    marginRight: '14.75px',
  },
  right: {
    flexGrow: 2,
    display: 'flex',
    alignItems: 'center',
    marginLeft: '14.75px',
    marginRight: '14.75px',
    maxWidth: '580px',
  },
  fieldName: {
    fontSize: '16px',
    textAlign: 'right',
  } as CSSProperties,
};

interface Props {
  classes: any;
  initialValues?: {
    name?: string;
    address?: string;
  },
  blockAddress?: boolean;
  onCancel?: any;
  onSubmit?: any;
  title?: string;
  blockchains?: any;
}

interface State {
  name?: string;
  address?: string;
  blockchain?: string;
}

export class ContactForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...this.props.initialValues,
      blockchain: (props.blockchains && props.blockchains.length > 0) ? props.blockchains[0].params.code : ''
    }
  }

  handleCancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  };

  handleSubmit = () => {
    if (this.props.onSubmit) {
      const { address, name, blockchain } = this.state;
      this.props.onSubmit({blockchain, address, name, description:''});
    }
  };

  handleAddressChange = (event: any) => {
    this.setState({
      address: event.target.value,
    })
  };

  handleChainChange = (chain: any) => {
    this.setState({
      blockchain: chain,
    })
  };

  handleNameChange = (event: any) => {
    this.setState({
      name: event.target.value,
    })
  };

  render() {
    const {
      blockAddress, title, classes, blockchains
    } = this.props;

    const {
      blockchain
    } = this.state;

    const {
      name, address
    } = this.state;

    return (
      <Page title={title}>
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
              chains={blockchains}
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
              type="text"
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
              type="text"
            />
          </div>
        </div>

        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <ButtonGroup>
              <Button
                label="Cancel"
                onClick={this.handleCancel}
              />
              <Button
                primary
                label="Save"
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
