import { markAssetError } from 'next/dist/client/route-loader';
import { getLocationOrigin } from 'next/dist/shared/lib/utils';
import { useRef, useEffect, useState } from 'react';

const defaultLocation = {lat: -34.397, lng: 150.644}

const LocationChooser = () => {
    const mapContainer = useRef(null);
    const [location, setLocation] = useState(defaultLocation);
    const [marker, setMarker] = useState(null);
    const [map, setMap] = useState(null);

    const getLocation = () => {
        const successCallback = (position) => {
            const newLocation = {lat: position.coords.latitude, lng: position.coords.longitude}
            setLocation(newLocation)
        };
          
        const errorCallback = (error) => {
            setLocation(defaultLocation)
        };
        
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    };

    useEffect(() => {
        // create a new map
        const map = new google.maps.Map(mapContainer.current, {
            center: location,
            zoom: 8
        });
    
        // create a new marker
        const marker = new google.maps.Marker({
            position: location,
            map: map,
            title: 'Choose location'
        });

        setMarker(marker);
        setMap(map);
    
        // add a listener to the map that waits for the user to click a location
        google.maps.event.addListener(map, 'click', function(event) {
            // update the stored location to the clicked location
            setLocation(event.latLng);
        });
        }, []); // the empty array ensures that the effect only runs once

        useEffect(() => {
            getLocation();
        }, []);

        useEffect(() => {
            if (marker && map) {
                marker.setPosition(location);
                map.setCenter(location);
            }
        }, [location]);
    
        return <div ref={mapContainer} style={{ width: '400px', height: '400px' }} />;
}

export default LocationChooser;
