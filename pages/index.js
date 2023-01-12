import Head from 'next/head';
import Image from 'next/image';
import leonLogo from '../assets/leon-logo.png';
import paperPlane from '../assets/paper-plane.png';
import { useRef, useEffect, useState } from 'react';
// import LocationChooser from './map.js';
import useAutosizeTextArea from "./tools/useAutosizeTextArea";

var countries = require("i18n-iso-countries");
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const defaultLocation = {lat: 40.7128, lng: -74.0060};
const categoryOptions = [
  "travel",
  "food",
  "tourism",
  "activity",
  "bar",
  "hotel"
]

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

  const getInitialLocation = () => {
      const successCallback = (position) => {
          const newLocation = {lat: position.coords.latitude, lng: position.coords.longitude}
          setLocation(newLocation)
      };
        
      const errorCallback = (error) => {
          setLocation(defaultLocation)
      };
      
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  };

  const setClosestCity = () => {
    // Search for cities within a 50 kilometer radius of the coordinates
    var radius = 10; // 10 kilometers
    const locationJSON = location//.toJSON()
    var url = 'http://api.geonames.org/findNearbyPostalCodes?' +
              'lat=' + locationJSON.lat +
              '&lng=' + locationJSON.lng +
              '&radius=' + radius +
              '&username=lmaksin';

    // Make a request to the URL
    fetch(url)
      .then(function(response) {
        return response.text();
      })
      .then(function(text) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text,"text/xml");
        const closest = xmlDoc.getElementsByTagName("code")[0];
        if (closest) {
          var name = closest.getElementsByTagName("name")[0].textContent;
          var country = closest.getElementsByTagName("countryCode")[0].textContent;
          const result = `${name}, ${countries.getName(country, "en")}`;
          setLocationText(result);
        } else {
          setLocationText('');
        }
      });
  }

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
        setLocation(event.latLng.toJSON());
    });
  }, []); // the empty array ensures that the effect only runs once

  useEffect(() => {
      getInitialLocation();
  }, []);

  useEffect(() => {
      if (marker && map) {
          marker.setPosition(location);
          map.setCenter(location);
          setClosestCity();
      }
  }, [location]);

  const textAreaRef = useRef(null);
  useAutosizeTextArea(textAreaRef.current, locationText);

  return (
    <div className="root">
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Travel Finder</h1>
          </div>
          <div className="header-subtitle">
            <h2>Let GPT-3 find you things to do and places to see anywhere! Use when traveling, or even in your home town 😁</h2>
          </div>
        </div>
        <div ref={mapContainer} style={{ width: '400px', height: '400px' }} className="google-map" />
        <div className="prompt-container">
          <div className="prompt-box">
            <span>Find me </span>
            <select
              className="prompt-text prompt-dropdown"
              value = { category }
              onChange = { (event) => setCategory(event.target.value) }
            >
              { categoryOptions.map( (category) => {
                return <option value={category}>{category}</option>
              }) }
            </select>
            <span> recommendations in </span>
            <textarea
              className="prompt-text prompt-location"
              value={locationText}
              onChange={ (event) => setLocationText(event.target.value) }
              ref={textAreaRef}
              maxlength="50"
            />
            <div className="prompt-buttons">
              <a
                className={isGenerating ? 'generate-button loading' : 'generate-button'}
                onClick={callGenerateEndpoint}
              >
                <div className="generate">
                {isGenerating ? <span className="loader"></span> : <Image src={paperPlane} alt="Send" width="25" />}
                </div>
              </a>
            </div>
          </div>
        </div>
        {apiOutput && (
        <div className="prompt-box">
          <p className="output-text">Sure! I've thought up a few options:</p>
          <p className="output-text">{apiOutput}</p>
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
