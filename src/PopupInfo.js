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
        <br/>
        <h5>
        <a target="_blank" rel="noreferrer" href={website}>{website}</a>
        </h5>
    </div>
  );
}

export default React.memo(PopupInfo);