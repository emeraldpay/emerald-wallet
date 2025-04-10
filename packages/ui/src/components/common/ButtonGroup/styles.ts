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

import { StyleRules } from '@mui/styles';

const styles: StyleRules = {
  container: {
    alignItems: 'center',
    display: 'flex',
  },
  containerVertical: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  firstItem: {
    marginLeft: 0,
  },
  restItem: {
    marginLeft: 10,
  },
  firstItemVertical: {
    marginTop: 0,
  },
  restItemVertical: {
    marginTop: 10,
  },
};

export default styles;
