import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css"
import { useRef, useState, useEffect, useCallback } from "react"
import Geocoder from 'react-map-gl-geocoder'
import ReactMapGL, {Source, Layer, NavigationControl, GeolocateControl, Marker, Popup, WebMercatorViewport, FlyToInterpolator, FullscreenControl } from "react-map-gl";
import pharmaciesData from './data/pharmaciesFi.geojson'
import CardInfo from './CardInfo'
import {clusterLayer, clusterCountLayer, unclusteredPointLayer} from './layers';
import crossPin from './cross.png'
import {Link} from 'react-router-dom';

const turf = require('@turf/turf');

const geolocateStyle = {
  top: 0,
  right: 0,
  padding: '10px'
};

const navStyle = {
  top: 72,
  right: 0,
  padding: '10px'
};

const fullscreenControlStyle = {
  top: 210,
  right: 0,
  padding: '10px'
};

const applyToArray = (func, array) => func.apply(Math, array)

const Home = () =>{

  const [viewport, setViewport] = useState({
    latitude:  60.1699,
    longitude: 24.9384,
    width: "100%",
    height: "90vh",
    zoom: 4
  });

  const [pharmacies, setPharmacies] = useState([]);
  const [pharmacy, setPharmacy] = useState('');
  const [error, setError] = useState(''); 

const token = "pk.eyJ1IjoibGl6emV0aGdkIiwiYSI6ImNrZjN3aHhvNDA3NzUzMm9mcWFlbDlrYm8ifQ.yc7NKxvjXXHpPBXBaukdYA"
const mapRef = useRef()
const geocoderContainerRef = useRef()
const geolocateContainerRef = useRef()

const handleViewportChange = useCallback(
  (newViewport) => setViewport(newViewport),[]
);

const handleResult = useCallback( (e) => {

console.log(e)

//const searchResult =  e.result.geometry
const searchResult =  e.result!==undefined ? e.result.geometry : [e.coords.longitude, e.coords.latitude]

//e.result.geometry

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

/* const pharmaciesMarkers= pharmacies.map(pharmacy=> 
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
    </Marker>)) */


  const pharmaciesList= pharmacies.map(pharmacy=> 
    ( 
   /* <Link to={`/ninja/${ninja._id}`} key={ninja._id}>  */
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
     /*  </Link>  */ 
  ))

/*<span className="">{pharmacy.properties.name}</span>
  <span className="">{pharmacy.properties.opening_hours}</span>
  <span className="">{pharmacy.properties.phone}</span>
  <span className="">{pharmacy.properties['addr:street']} {pharmacy.properties['addr:housenumber']}</span>
  <span className="">{pharmacy.properties['postal_code']} {pharmacy.properties['addr:city']}</span>
  <span className="">{pharmacy.properties.website} </span>
  <span className="">{pharmacy.properties.distance} </span> */
   
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

  const onClick = e => {
    
    const feature = e.features[0];

    if (feature.layer.id === 'clusters'){
      
    const clusterId = feature.properties.cluster_id;
  
    const mapboxSource = mapRef.current.getMap().getSource('pharmacies');
  
    mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) {
        return;
      }
      
      setViewport({
        ...viewport,
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
        zoom,
        transitionDuration: 500
      });
    });
 
  }else if (feature.layer.id === 'unclustered-point'){
    
    setViewport({
      ...viewport,
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1],
      zoom:14,
      transitionDuration: 500
    })
;

  }else{
    return null
  }
  }

  const onHover = e => { 
    if (e.features[0] !== undefined)  {
      const feature = e.features[0];
         if (feature.layer.id === 'unclustered-point') { setPharmacy(feature) }
  } 
  }

  const onLoad = useCallback(() => {
    const map = mapRef.current.getMap();
     map.loadImage('./cross.png', (error, image) => {
    if (error) throw error;
    if (!map.hasImage('crossPin')) map.addImage('crossPin', image, );
        });
  }, [mapRef])
    

/* const handleGeocoderViewportChange = useCallback(
  (newViewport) => {
    const geocoderDefaultOverrides = { transitionDuration: 1000 };

    return handleViewportChange({
      ...newViewport,
      ...geocoderDefaultOverrides
    });
  },
  []
); */

  return (
    <div className="App">
    <div className='App-header '> 
    <Link to={'/'}><h2 className="title">Pharmacy Locator - REST API</h2> </Link> 
        <form id="form">
                  <div ref={geocoderContainerRef} className=''></div>
                  <div ref={geolocateContainerRef} className=''></div>
                  {/* <label>Radio km:<input type="text" name="radio" /></label> */}
        </form>
    </div>
    <div className='App-container'>
    <div className='App-left'>
      <div id='map'>
        <  ReactMapGL  
              ref={mapRef}
            {...viewport}
            onViewportChange={setViewport}
            mapStyle="mapbox://styles/mapbox/streets-v11"  
            mapboxApiAccessToken={token}
            interactiveLayerIds={[clusterLayer.id, unclusteredPointLayer.id]}
            onClick={onClick}
            onLoad={onLoad}
            onHover={onHover}
            >
            {/*   {pharmaciesMarkers } */}
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
            containerRef={geolocateContainerRef}
            style={geolocateStyle}
            onGeolocate={handleResult}
            positionOptions={{enableHighAccuracy: true}}
            />
          {/* </div> */}
          {pharmacyPopup }
          <Source
          id="pharmacies"
          type="geojson"
          data= {pharmaciesData.slice(0, 2000)}
          cluster={true}
      
          clusterMaxZoom={24}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer  {...unclusteredPointLayer} />
        </Source>
          </ReactMapGL>
          </div>  
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

export default Home;
