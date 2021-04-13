import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css"
import { useRef, useState, useEffect, useCallback } from "react"
import Geocoder from 'react-map-gl-geocoder'
import ReactMapGL, { NavigationControl, GeolocateControl, Marker, Popup, WebMercatorViewport, FlyToInterpolator, FullscreenControl } from "react-map-gl";
import pharmaciesData from './data/pharmaciesFi.json'
import CardInfo from './CardInfo'
import useSupercluster from 'use-supercluster';
import DropDown from './DropDown'

const turf = require('@turf/turf');

const geolocateStyle = {
  right: 30,
  padding: 10,
  top: -1,
  zIndex: 2
}

const navStyle = {
  top: 72,
  right: 0,
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
    latitude:  60.1699,
    longitude: 24.9384,
    width: "100%",
    height: "90%",
    zoom: 16
  });

  const [pharmacies, setPharmacies] = useState([]);
  const [pharmacy, setPharmacy] = useState('');
  const [kilometres, setKilometres] = useState(5);
  //const [error, setError] = useState('')

const token = "pk.eyJ1IjoibGl6emV0aGdkIiwiYSI6ImNrZjN3aHhvNDA3NzUzMm9mcWFlbDlrYm8ifQ.yc7NKxvjXXHpPBXBaukdYA"
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

const viewport = new WebMercatorViewport({ width: 800, height: 600 })
.fitBounds(cornersLongLat, { padding:  3})

const geocoderDefaultOverrides = {longitude: viewport.longitude, latitude: viewport.latitude, 
                      zoom: nearest.length >1 ? viewport.zoom : 15, transitionDuration: 1000 }

return handleViewportChange({
...geocoderDefaultOverrides
});
},[handleViewportChange, kilometres]
)

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
        <p>{pharmacy.properties['addr:postcode']} {pharmacy.properties['addr:city']}</p>
        <p>{pharmacy.properties.website}</p>
      </div>
    </Popup>)
  : null  

  const pharmaciesList= pharmacies.map((pharmacy, i)=> 
    ( 
   /*  <Link to={`/ninja/${ninja._id}`} key={ninja._id}> */
      <li key={i}>
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
   /*  </Link>  */
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
                    height: `${10 + (pointCount / pharmacies.length) * 30}px`
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
            onClick={e => {
              e.preventDefault()
                setViewport({
                  ...viewport,
                  latitude: latitude,
                  longitude: longitude,
                  zoom: 14,
                  transitionInterpolator: new FlyToInterpolator({speed: 2 }),
                  transitionDuration: "auto"
                })  
                }} 
              >
              <img src='location48.png' alt='#' />
          </button>
      </Marker>)

  })
  console.log(kilometres)


  return (
    <div className="App">
    <div className=''>
    <div className='App-header '> 
        <h2 className="title">Pharmacy Locator - REST API</h2>  
        <form id="form">
            <DropDown onChange={(km) => changeKm(km)}/>
            <div ref={geocoderContainerRef} className='geocoderContainer'></div>
        </form>
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
               {/*pharmaciesMarkers*/}
        {/*   <div className='map-controlls'> */}
            <NavigationControl style={navStyle} />
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
          {/* </div> */}
            {pharmacyPopup }
          </ReactMapGL>
        </div> 
        <div className='App-right'>
         {pharmaciesList}
        </div>
        </div>
        </div>
        <div className='App-footer'>
        <p>Pharmacy Locator App © Lizzeth Garcia</p>
        </div>       
    </div>
    
  );
}

export default Home;

// style={{ position: 'relative', top: 0,  marginTop: '75px', zIndex: 0}}