import React from 'react';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import { FlatButton } from 'material-ui';
import Card from '../Card';

import formStyles from './form.scss';

export const styles = {
    fieldName: {
        color: '#747474',
        fontSize: '16px',
        textAlign: 'right',
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
    formRow: {
        display: 'flex',
        marginBottom: '19px',
        alignItems: 'center',
    },
};

const flatButtonNav = {
    color: '#747474',
    fontSize: '14px',
    lineHeight: '24px',
};


export const Row = (props) => {
    return (
      <div className={ formStyles.formRow }>
          {props.children}
      </div>
    );
};

export class Form extends React.Component {

    render() {
        const { children, caption, onCancel } = this.props;
        const backLabel = 'DASHBOARD';

        return (
            <Card>
                <div className={formStyles.form}>
                <div id="header" style={styles.formRow}>
                    <div style={styles.left}>
                        <FlatButton label={backLabel}
                                    primary={true}
                                    onClick={onCancel}
                                    style={flatButtonNav}
                                    icon={<KeyboardArrowLeft/>}
                        />

                    </div>
                    <div style={styles.right}>
                        <div id="caption" style={{fontSize: '22px'}}>
                            {caption}
                        </div>
                    </div>
                </div>
                <div id="body" style={{paddingTop: '30px'}}>
                    {children}
                </div>
                </div>
            </Card>);
    }
}

