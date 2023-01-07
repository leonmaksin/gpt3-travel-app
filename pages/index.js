import Head from 'next/head';
import Image from 'next/image';
import leonLogo from '../assets/leon-logo.png';
import { useState } from 'react';
import LocationChooser from './map.js';

const Home = () => {
  const [userInput, setUserInput] = useState('');
  const [apiOutput, setApiOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const callGenerateEndpoint = async () => {
    setIsGenerating(true);
    
    console.log("Calling OpenAI...")
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput }),
    });

    const data = await response.json();
    const { output } = data;
    console.log("OpenAI replied...", output.text)

    setApiOutput(`${output.text}`);
    setIsGenerating(false);
  }

  const onUserChangedText = (event) => {
    setUserInput(event.target.value);
  };

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
        <LocationChooser />
        <div className="prompt-container">
          <textarea
            placeholder="start typing here"
            className="prompt-box"
            value={userInput}
            onChange={onUserChangedText}
          />
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
