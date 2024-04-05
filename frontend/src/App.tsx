import React, { useState } from 'react';
// import logo from './logo.svg';
import './App.css';
// import Button from 'react-bootstrap/Button';
import CityForm from './CityForm';
import { IOption } from './OptionType';

function App() {
  const [city, setCity] = useState<string | undefined>('');
  const [similarCities, setSimilarCities] = useState<string[]>([]);

  const handleSelectionChange = (selectedOption: IOption | null) => {
    // Assuming you want to do something with the selected option
    console.log('Selected value:', selectedOption?.value);
    setCity(selectedOption?.value)
  };

  return (
    <>
      <CityForm handleChange={handleSelectionChange}/>
        <h2>
          Top 10 Similar Cities to "{city}":
        </h2>
    </>
  );
}

export default App;
