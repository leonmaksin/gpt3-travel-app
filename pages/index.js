import Head from 'next/head';
import Image from 'next/image';
import leonLogo from '../assets/leon-logo.png';
import { useRef, useEffect, useState } from 'react';
// import LocationChooser from './map.js';

const defaultLocation = {lat: -34.397, lng: 150.644}

const Home = () => {
  const [apiOutput, setApiOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [category, setCategory] = useState('travel');
  const [locationText, setLocationText] = useState('');

  const mapContainer = useRef(null);
  const [location, setLocation] = useState(defaultLocation);
  const [marker, setMarker] = useState(null);
  const [map, setMap] = useState(null);

  const callGenerateEndpoint = async () => {
    setIsGenerating(true);

    const aiInput = `Find me ${category} recommendations in ${locationText}`;
    
    console.log("Calling OpenAI...")
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ aiInput }),
    });

    const data = await response.json();
    const { output } = data;
    console.log("OpenAI replied...", output.text);

    setApiOutput(`${output.text}`);
    setIsGenerating(false);
  }

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
            setLocationText("Hello there!");
        }
    }, [location]);

  return (
    <div className="root">
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Travel Finder</h1>
          </div>
          <div className="header-subtitle">
            <h2>Find things to do and places to see when traveling, or even in your home town</h2>
          </div>
        </div>
        <div ref={mapContainer} style={{ width: '400px', height: '400px' }} />
        <div className="prompt-container">
          <div className="prompt-box">
            <span>Find me </span>
            <select
              className="prompt-text prompt-dropdown"
              value = { category }
              onChange = { (event) => setCategory(event.target.value) }
            >
              <option value="travel">travel</option>
              <option value="food">food</option>
              <option value="tourism">tourism</option>
              <option value="activity">activity</option>
            </select>
            <span> recommendations in </span>
            <textarea
              className="prompt-text prompt-location"
              value={locationText}
              onChange={ (event) => setLocationText(event.target.value) }
            />
          </div>
        </div>
        <div className="prompt-buttons">
          <a
            className={isGenerating ? 'generate-button loading' : 'generate-button'}
            onClick={callGenerateEndpoint}
          >
            <div className="generate">
            {isGenerating ? <span className="loader"></span> : <p>Generate</p>}
            </div>
          </a>
        </div>
        {apiOutput && (
        <div className="output">
          <div className="output-header-container">
            <div className="output-header">
              <h3>Output</h3>
            </div>
          </div>
          <div className="output-content">
            <p>{apiOutput}</p>
          </div>
        </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://leonmaksin.me/"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={leonLogo} alt="" />
            <p>more projects by leon</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
