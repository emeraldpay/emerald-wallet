import * as React from 'react';

interface Props {
  data?: string;
}

const TxInputData = (props: Props) => {
  const { data } = props;

  if (!data) {
    return null;
  }
  if (data.length <= 20) {
    return (<div>{data === '0x' ? 'none' : data}</div>);
  }
  return (
    <textarea
      rows={10}
      value={data}
    />
  );
};

export default TxInputData;
