import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css"
import { useRef, useState, useEffect, useCallback } from "react"
import Geocoder from 'react-map-gl-geocoder'
import ReactMapGL, { NavigationControl, GeolocateControl, Marker, Popup, WebMercatorViewport, FlyToInterpolator, FullscreenControl } from "react-map-gl";
import pharmaciesData from './data/pharmaciesFi.json'
import CardInfo from './CardInfo'
import useSupercluster from 'use-supercluster';
import DropDown from './DropDown'
import {render} from 'react-dom';
import PopupInfo from './PopupInfo'

const turf = require('@turf/turf');

const geolocateStyle = {
  padding: 10,
  zIndex: 2
}

const navStyle = {
  padding: 10
};

const fullscreenControlStyle = {
  top: 210,
  right: 0,
  padding: 10
};

const applyToArray = (func, array) => func.apply(Math, array)

const Home = () =>{

  const [viewport, setViewport] = useState({
    latitude:  60.2055,
    longitude: 24.9384,
    width: "97.5%",
    height: "88.5%",
    zoom: 9
  });

  const [pharmacies, setPharmacies] = useState([]);
  const [pharmacy, setPharmacy] = useState('');
  const [kilometres, setKilometres] = useState(5);
  //const [error, setError] = useState('')

const token = process.env.REACT_APP_MAPBOX_TOKEN 
const mapRef = useRef()

const geocoderContainerRef = useRef()

const changeKm = (km) => {
  console.log(`You choosed ${km}`);
  setKilometres(km)
} 

const handleViewportChange = useCallback(
  (newViewport) => setViewport(newViewport),[]
);

const handleResult = useCallback( (e) => {

    console.log(e)

    //const searchResult =  e.result.geometry
    const searchResult =  e.result!==undefined ? e.result.geometry : [e.coords.longitude, e.coords.latitude]

    //e.result.geometry
   const km = kilometres

    const options = { units: 'kilometers' };

    pharmaciesData.features.forEach((pharmacy) => {
    Object.defineProperty(pharmacy.properties, 'distance', {
    value: turf.distance(searchResult, pharmacy.geometry.coordinates, options),
    writable: true,
    enumerable: true,
    configurable: true
    });
    Object.defineProperty(pharmacy.properties, 'cluster', {
      value: false,
      enumerable: true
      });
    });

/* pharmaciesData.features */
const nearest= pharmaciesData.features.filter(pharmacy =>  (pharmacy.properties.distance <= km) );

console.log(nearest[0].properties.distance)
console.log(kilometres)
console.log(nearest[0].properties.distance <= kilometres)

nearest.sort((a, b) => a.properties.distance - b.properties.distance)

setPharmacies(nearest)

const pointsLong = nearest.map(point => point.geometry.coordinates[0])
const pointsLat = nearest.map(point => point.geometry.coordinates[1])
const cornersLongLat =  [
  [applyToArray(Math.min, pointsLong), applyToArray(Math.min, pointsLat)],
  [applyToArray(Math.max, pointsLong), applyToArray(Math.max, pointsLat)]
]
//setBounds(cornersLongLat)

const viewport = new WebMercatorViewport({ width: 600, height: 400 })
.fitBounds(cornersLongLat, { paddingTop: 40, paddingButtom: 40})

const geocoderDefaultOverrides = {longitude: viewport.longitude, latitude: viewport.latitude, 
                      zoom: nearest.length >1 ? viewport.zoom : 15, transitionDuration: 1000 }

return handleViewportChange({
...geocoderDefaultOverrides
});
},[handleViewportChange, kilometres]
)

const goToSingleLocation = (e, latitude, longitude) => {
  e.preventDefault()
  setViewport({
    ...viewport,
    latitude: latitude,
    longitude: longitude,
    zoom: 15.5,
    transitionInterpolator: new FlyToInterpolator({speed: 2 }),
    transitionDuration: "auto"
  }) 
}

const pharmacyPopup  = pharmacy 
  ? 
    (<Popup
      className='popupStyle'
      latitude={pharmacy.geometry.coordinates[1]}
      longitude={pharmacy.geometry.coordinates[0]}
      onClose={setPharmacy}
    >
      <PopupInfo pharmacy={pharmacy.properties}/>
    </Popup>)
  : null  

  const pharmaciesList= pharmacies.map((pharmacy, i)=> 
    ( 
      <li key={i} >
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
         latitude={pharmacy.geometry.coordinates[1]}
         longitude={pharmacy.geometry.coordinates[0]}
         goToSingleLocation={goToSingleLocation}
        >

        </CardInfo>
    </li>
    )
  )

const bounds = mapRef.current ? mapRef.current.getMap().getBounds().toArray().flat() : null

const { clusters, supercluster  } = useSupercluster({
  points: pharmacies,
  bounds: bounds,
  zoom: viewport.zoom,
   options: { radius: 75, maxZoom: 20 }
});

if (pharmacies.length > 0) {console.log(clusters)}

const pharmaciesClusters  = clusters.map(cluster => {
  const [longitude, latitude] = cluster.geometry.coordinates;
  const {cluster: isCluster, point_count: pointCount} = cluster.properties;

    if (isCluster) { 
      return (
        <Marker
                key={cluster.id}
                latitude={latitude}
                longitude={longitude}
        >
         <div
                  className="cluster-marker"
                  style={{
                    width: `${10 + (pointCount / pharmacies.length) * 30}px`,
                    height: `${10 + (pointCount / pharmacies.length) * 30}px`,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      20
                    );

                    setViewport({
                      ...viewport,
                      latitude,
                      longitude,
                      zoom: expansionZoom,
                      transitionInterpolator: new FlyToInterpolator({speed: 2}),
                      transitionDuration: "auto"
                    });
                  }}
                >
                  {pointCount}
                </div> 
        </Marker>
      )
      }

  return (<Marker key={cluster.properties['@id']} 
      latitude={latitude}
      longitude={longitude}
      offsetLeft={-20}
        offsetTop={-10}>
          <button className='marker'
            onMouseOver={() =>  {setPharmacy(cluster)} } 
            onClick={e => {goToSingleLocation(e, latitude, longitude)}} 
          >
              <img src='location45.png' alt='#' />
          </button>
      </Marker>)

  })
  console.log(kilometres)


  return (
    <div className="App">
    <div className="App-main">
    <div className='App-header'> 
        <div id="title">&nbsp;&nbsp;Pharmacy Locator  </div>  
        <div id="form">
            <DropDown onChange={(km) => changeKm(km)}/>
            <div ref={geocoderContainerRef}  
             className='geocoderContainer'  > 
            </div>
        </div>
    </div>
    <div className='App-container'>
    <div className='App-left'>  
        < ReactMapGL  
            ref={mapRef}
            {...viewport} 
            maxZoom={20}
            onViewportChange={handleViewportChange}
            mapStyle="mapbox://styles/mapbox/streets-v11"  
            mapboxApiAccessToken={token}
            className={'mapClass'}
            >
              {pharmaciesClusters}
            <NavigationControl style={navStyle} className='navControl'/>
            <Geocoder
            mapRef={mapRef}
            containerRef={geocoderContainerRef}
            mapboxApiAccessToken={token}
            marker={false}
            countries={'fi'}
            placeholder={'Enter the location'}
            onResult={handleResult}
            />
            <FullscreenControl style={fullscreenControlStyle} />
          <GeolocateControl
            style={geolocateStyle}
            onGeolocate={handleResult}
            positionOptions={{enableHighAccuracy: true}}
            showAccuracyCircle={false}
            label={'Find a pharmacy with your location'}
            className={'geolocateClass'}
            />
            {pharmacyPopup }
          </ReactMapGL>
        </div> 
        <div className='App-right'>
         {pharmaciesList}
        </div>
        </div>
        </div>
        <div className='App-footer'>
        <p>Pharmacy Locator App ?? Lizzeth Garcia</p>
       </div>       
    </div>
    
  );
}

export default Home;

export function renderToDom(container) {
  render(< Home/>, container);
}
// style={{ position: 'relative', top: 0,  marginTop: '75px', zIndex: 0}}