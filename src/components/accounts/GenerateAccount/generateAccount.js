import React from 'react';
import { connect } from 'react-redux';

import saveAs from 'lib/saveAs';
import { gotoScreen } from '../../../store/screenActions';
import PasswordDialog from './PasswordDialog';
import DownloadDialog from './DownloadDialog';
import ShowPrivateDialog from './ShowPrivateDialog';
import AccountPropertiesDialog from './AccountPropertiesDialog';

const PASSWORD_PAGE = 1;
const DOWNLOAD_PAGE = 2;
const PRIVATE_PAGE = 3;
const ACCOUNT_PROPS_PAGE = 4;

class GenerateAccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: PASSWORD_PAGE,
        };
    }

    generate = () => {
        this.setState({
            page: DOWNLOAD_PAGE,
        });
    };

    download = () => {
        const fileData = {
            filename: 'hz.json',
            mime: 'text/plain',
            contents: '',
        };

        const blob = new Blob([fileData.contents], {type: fileData.mime});
        const url = URL.createObjectURL(blob);
        saveAs(url, fileData.filename);

        this.setState({
            page: PRIVATE_PAGE,
        });
    }

    editAccountProps = () => {
        this.setState({
            page: ACCOUNT_PROPS_PAGE,
        });
    }

    skipAccountProps = () => {
        this.props.dispatch(gotoScreen('home'));
    }

    render() {
        const { page } = this.state;
        switch (page) {
            case PASSWORD_PAGE:
                return (<PasswordDialog onGenerate={ this.generate }/>);
            case DOWNLOAD_PAGE:
                return (<DownloadDialog onDownload={ this.download }/>);
            case PRIVATE_PAGE:
                return (<ShowPrivateDialog onNext={ this.editAccountProps }/>);
            case ACCOUNT_PROPS_PAGE:
                return (<AccountPropertiesDialog onSkip={ this.skipAccountProps } />);
        }
    }
}

export default connect()(GenerateAccount);
