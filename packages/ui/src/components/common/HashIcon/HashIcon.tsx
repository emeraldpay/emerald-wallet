import { HasherType, hashicon, Params } from '@emeraldpay/hashicon';
import * as React from 'react';
import { Component } from 'react';

export interface OwnProps {
  className?: string;
  hasher?: HasherType;
  options?: Params;
  size?: number;
  value: string;
}

export class HashIcon extends Component<OwnProps> {
  shouldComponentUpdate(nextProps: OwnProps): boolean {
    // Check only 3 main properties for changes
    return (
      this.props.hasher !== nextProps.hasher ||
      this.props.size !== nextProps.size ||
      this.props.value !== nextProps.value
    );
  }

  render(): React.ReactNode {
    const { className, hasher, size, value } = this.props;

    let options = { ...this.props.options };

    if (typeof hasher == 'string') {
      options = { ...options, ...{ hasher } };
    }

    if (typeof size === 'number') {
      options = { ...options, ...{ size } };
    }

    const icon = hashicon(value, options).toDataURL();

    return <img alt={value} className={className} src={icon} width={size} />;
  }
}

export default HashIcon;
