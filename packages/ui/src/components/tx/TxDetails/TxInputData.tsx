import * as React from 'react';

interface ITxInputDataProps {
  data?: string;
}

const TxInputData = (props: ITxInputDataProps) => {
  const { data } = props;

  if (!data) {
    return null;
  }
  if (data.length <= 20) {
    return (<div>{data === '0x' ? 'none' : data}</div>);
  }
  return (
    <textarea
      readOnly={true}
      rows={10}
      value={data}
    />
  );
};

export default TxInputData;
