import React from 'react';

const PopupInfo = (props) => {

  const {pharmacy} = props;
  const website = `${pharmacy.website}`

  return (
    <div  >
      <h2>{pharmacy.name}</h2>
        <p>{pharmacy.opening_hours}</p>
        <p>{pharmacy.phone}</p>
        <p>{pharmacy['addr:street']} {pharmacy['addr:housenumber']}</p>
        <p>{pharmacy['addr:postcode']} {pharmacy['addr:city']}</p>
        <a target="_blank" rel="noreferrer" href={website} style={{ color: '#39FF14'}}><div className='popupLink'>{ website!=='undefined'  ? website : 'not available information'}</div></a>
    </div>
  );
}

export default React.memo(PopupInfo);