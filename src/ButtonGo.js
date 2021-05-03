import React from 'react';


const ButtonGo = ({longitude, latitude, handleClick}) => {
  
    return (
      <button
        className="buttonGo"
        onClick={e => {handleClick(e, latitude, longitude)}}>Go</button>
    );

}

export default ButtonGo;