import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css"
import Geocoder from 'react-map-gl-geocoder'
import ReactMapGL, { NavigationControl, GeolocateControl, FullscreenControl } from "react-map-gl";

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

const Map = ({ mapRef, geocoderContainerRef, viewport, handleResult, handleViewportChange, markers, popup }) => {

    const token = "pk.eyJ1IjoibGl6emV0aGdkIiwiYSI6ImNrZjN3aHhvNDA3NzUzMm9mcWFlbDlrYm8ifQ.yc7NKxvjXXHpPBXBaukdYA"

return (
<div className="map"> 
     < ReactMapGL  
        ref={mapRef}
        {...viewport} 
        maxZoom={20}
        onViewportChange={handleViewportChange}
        mapStyle="mapbox://styles/mapbox/streets-v11"  
        mapboxApiAccessToken={token}  
    >
    {markers}
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
    />
    {popup}
    </ReactMapGL>
</div>
)
}

export default Map;