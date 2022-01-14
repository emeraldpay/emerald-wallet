import * as React from 'react';
import {Component} from "react";
import {Params, hashicon, HasherType} from "@emeraldpay/hashicon";

export interface Props {
  value: string;
  size?: number;
  hasher?: HasherType;
  options?: Params;
}

export class HashIcon extends Component<Props, {}> {
  shouldComponentUpdate(nextProps: Props, nextState): boolean {
    // Check only 3 main properties for changes
    return (this.props.value !== nextProps.value) ||
      (this.props.size !== nextProps.size) ||
      (this.props.hasher !== nextProps.hasher);
  }

  render() {
    const value = this.props.value;
    let options = {};

    if (typeof options != "undefined") {
      options = {...options, ...this.props.options};
    }
    if (typeof this.props.size == "number") {
      options = {...options, ...{size: this.props.size}};
    }
    if (typeof this.props.hasher == "string") {
      options = {...options, ...{hasher: this.props.hasher}};
    }
    const icon = hashicon(value, options).toDataURL();
    const attributes = {
      src: icon,
      alt: value
    };
    if (typeof this.props.size == 'number') {
      attributes["width"] = this.props.size;
    }
    return (<img {...attributes}/>);
  }
}

export default HashIcon