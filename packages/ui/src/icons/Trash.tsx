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

const Trash: React.ComponentType<SvgIconProps> = (props) => (
  <SvgIcon style={{fill: 'none'}} stroke="currentColor" fill="none" strokeWidth="4" viewBox="0 0 64 64" {...props} >
    <path
      d="M52 16l-4 40H16l-4-40m8 0v-3.94A4.06 4.06 0 0 1 24.06 8h15.88A4.06 4.06 0 0 1 44 12.06V16M8 16h48M24 28l16 16m0-16L24 44"/>
  </SvgIcon>
);

export default Trash;
