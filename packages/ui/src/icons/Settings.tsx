/*
Copyright 2019 ETCDEV GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import * as React from 'react';
import SvgIcon, {SvgIconProps} from '@material-ui/core/SvgIcon';

const Settings: React.ComponentType<SvgIconProps> = (props) => (
  <SvgIcon style={{fill: 'none'}} stroke="currentColor" fill="none" strokeWidth="4" viewBox="0 0 64 64" {...props} >
    <path
      d="M56 32a24.17 24.17 0 0 0-.32-3.89L48 25.37 51.5 18a24.14 24.14 0 0 0-5.5-5.5L38.63 16l-2.74-7.68a24.15 24.15 0 0 0-7.78 0L25.37 16 18 12.5a24.14 24.14 0 0 0-5.5 5.5l3.5 7.37-7.68 2.74a24.15 24.15 0 0 0 0 7.78L16 38.63 12.5 46a24.13 24.13 0 0 0 5.5 5.5l7.37-3.5 2.73 7.69a24.14 24.14 0 0 0 7.78 0L38.63 48 46 51.5a24.13 24.13 0 0 0 5.5-5.5L48 38.63l7.69-2.73A24.18 24.18 0 0 0 56 32z"/>
    <circle cx="32" cy="32" r="4"/>
  </SvgIcon>
);

export default Settings;
