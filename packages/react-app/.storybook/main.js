// see { StorybookConfig } from '@storybook/react-webpack5';
const config = {
  framework: '@storybook/react-webpack5',
  stories: [
    '../stories/**/*.stories.tsx'
  ],
  docs: {
    autodocs: false
  }
};

export default config;
