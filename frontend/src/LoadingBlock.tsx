import React from 'react';

const LoadingBlock: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    <div style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {isLoading ? (
        <img
          src="media/MapLoadingWheel.svg"
          style={{
            display: 'block',
            marginTop: '50px',
            marginBottom: '10px',
            width: '120px' 
          }}
        />
      ) : (
        <div /> // show nothing
      )}
    </div>
  );
};

export default LoadingBlock;
