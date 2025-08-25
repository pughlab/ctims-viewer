import React from 'react';

const CtimsEditor = () => {
  const ctimsUrl = process.env.REACT_APP_CTIMS_URL;
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <iframe
        src={ctimsUrl}
        title="CTIMS Editor"
        style={{
          width: '100%',
          height: '105%',
          border: 'none',
          position: 'absolute',
          top: '0%', 
          left: 0,
        }}
      />
    </div>
  );
};

export default CtimsEditor;