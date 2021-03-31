
import {NavLink} from 'react-router-dom'
import { useRef, useState, useEffect, useCallback } from "react"
import * as pharmaciesData from './data/pharmaciesFi.json'
import { Marker, Popup, WebMercatorViewport, FlyToInterpolator } from "react-map-gl";
import CardInfo from './Card'
import Map from './Map'

const turf = require('@turf/turf');

const applyToArray = (func, array) => func.apply(Math, array)

const App = () =>{

  const [viewport, setViewport] = useState({
    latitude:  60.1699,
    longitude: 24.9384,
    width: "100%",
    height: "90vh",
    zoom: 16
  });

  const [pharmacies, setPharmacies] = useState([]);
  const [pharmacy, setPharmacy] = useState('');
  const [error, setError] = useState(''); 

const mapRef = useRef()
const geocoderContainerRef = useRef()
const geolocateContainerRef = useRef()

const handleViewportChange = useCallback(
    (newViewport) => setViewport(newViewport),[]
);

const handleResult = useCallback( (e) => {

    console.log(e)

    const searchResult =  e.result!==undefined ? e.result.geometry : [e.coords.longitude, e.coords.latitude]

    const options = { units: 'kilometers' };

    pharmaciesData.features.forEach((pharmacy) => {
      Object.defineProperty(pharmacy.properties, 'distance', {
        value: turf.distance(searchResult, pharmacy.geometry.coordinates, options),
        writable: true,
        enumerable: true,
        configurable: true
      });
    });

    const nearest= pharmaciesData.features.filter(pharmacy => pharmacy.properties.distance <= 5);

    nearest.sort((a, b) => a.properties.distance - b.properties.distance)

    setPharmacies(nearest)

    const pointsLong = nearest.map(point => point.geometry.coordinates[0])
    const pointsLat = nearest.map(point => point.geometry.coordinates[1])
    const cornersLongLat =  [
    [applyToArray(Math.min, pointsLong), applyToArray(Math.min, pointsLat)],
    [applyToArray(Math.max, pointsLong), applyToArray(Math.max, pointsLat)]
    ]
    const viewport = new WebMercatorViewport({ width: 800, height: 600 })
    .fitBounds(cornersLongLat, { padding:  3})

    const geocoderDefaultOverrides = {longitude: viewport.longitude, latitude: viewport.latitude, 
                        zoom: nearest.length >1 ? viewport.zoom : 15, transitionDuration: 1000 }

    return handleViewportChange({
    ...geocoderDefaultOverrides
    });
},[]
)

const pharmaciesMarkers= pharmacies.map(pharmacy=> 
  (<Marker key={pharmacy.properties['@id']} 
    latitude={pharmacy.geometry.coordinates[1]}
    longitude={pharmacy.geometry.coordinates[0]}
    offsetLeft={-20}
      offsetTop={-10}>
        <button className='marker'
          onMouseOver={() =>  {setPharmacy(pharmacy)} } 
          onClick={e => {
            e.preventDefault()
              setViewport({
                ...viewport,
                longitude: pharmacy.geometry.coordinates[0],
                latitude: pharmacy.geometry.coordinates[1],
                zoom: 14,
                transitionInterpolator: new FlyToInterpolator({speed: 2 }),
                transitionDuration: "auto"
              })  
              }} 
            >
            <img src='cross.png' alt='#' />
        </button>
    </Marker>))

const pharmacyPopup  = pharmacy 
  ? 
    (<Popup 
      latitude={pharmacy.geometry.coordinates[1]}
      longitude={pharmacy.geometry.coordinates[0]}
      onClose={() => {
          setPharmacy(null)
      }}
    >
      <div>
        <h2>{pharmacy.properties.name}</h2>
        <p>{pharmacy.properties.opening_hours}</p>
        <p>{pharmacy.properties.phone}</p>
        <p>{pharmacy.properties['addr:street']} {pharmacy.properties['addr:housenumber']}</p>
        <p>{pharmacy.properties['postal_code']} {pharmacy.properties['addr:city']}</p>
        <p>{pharmacy.properties.website}</p>
      </div>
    </Popup>)
  : null  

  const pharmaciesList= pharmacies.map(pharmacy=> 
    ( 
   /*  <Link to={`/ninja/${ninja._id}`} key={ninja._id}> */
      <li key={pharmacy.properties['@id']}>
        <CardInfo
         name={pharmacy.properties.name}
         openinHours={pharmacy.properties.opening_hours}
         phone={pharmacy.properties.phone}
         addres={pharmacy.properties['addr:street']}
         houseNumero={pharmacy.properties['addr:housenumber']}
         postalCode={pharmacy.properties['addr:postcode']}
         city={pharmacy.properties['addr:city']}
         web={pharmacy.properties.website}
         distance={pharmacy.properties.distance}
        >
        </CardInfo>
    </li>
    )
  )

  return (
    <div className="App">
    <div className='App-header '> 
        <h2 className="title">Pharmacy Locator - REST API</h2>  
        <form id="form">
                  <div ref={geocoderContainerRef} className=''></div>
                  <div ref={geolocateContainerRef} className=''></div>
                  {/* <label>Radio km:<input type="text" name="radio" /></label> */}
        </form>
    </div>
    <div className='App-container'>
    <div className='App-left'>  
      <Map
        mapRef={mapRef}
        geocoderContainerRef={geocoderContainerRef}
        viewport={viewport}
        handleResult={handleResult}
        markers={pharmaciesMarkers}
        popup={pharmacyPopup}
        handleViewportChange={handleViewportChange}
      >
      </Map>
    </div> 
    <div className='App-right'>
         {pharmaciesList}
    </div>
    </div>
    <div className='App-footer'>
        <p>Pharmacy Locator App © Lizzeth Garcia</p>
        </div>       
    </div>
    
  );
}

export default App;
