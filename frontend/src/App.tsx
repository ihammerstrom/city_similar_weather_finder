import React, { useState } from 'react';
// import logo from './logo.svg';
import './App.css';
// import Button from 'react-bootstrap/Button';
import CityForm from './CityForm';
import { IOption } from './OptionType';
import { API_URL } from './config';
import { CityWeatherData } from './CityWeatherData';
import CityWeatherGraph from './CityWeatherGraph';

// interface IProps {
//   handleChange: (newValue: SingleValue<IOption>, actionMeta: ActionMeta<IOption>) => void;
// }

 // Define the top-level structure to hold all city data

function App() {
  const [cityName, setCityName] = useState<string | undefined>('');
  const [similarCities, setSimilarCities] = useState<CityWeatherData[]>([]);

  const handleCityChange = (selectedOption: IOption | null) => {
    // Assuming you want to do something with the selected option
    console.log('Selected value:', selectedOption?.value);
    setCityName(selectedOption?.value)
  };

  const fetchCityData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Make API call to send selected city
    try {
      const response = await fetch(`${API_URL}/get_similar_cities?city_name=${cityName}`);
      const data = await response.json();
      console.log('Response from sending city:', data);
      setSimilarCities(data['cities'])
  
    } catch (error) {
      console.error('Error sending city:', error);
    }
  };
  

  return (
    <>
      <CityForm handleChange={handleCityChange} handleSubmit={fetchCityData}/>
        <h2>
          Top {similarCities.length} Similar Cities to "{cityName}":
        </h2>
        {similarCities
          .slice() // Create a copy to avoid mutating the original array
          .sort((a, b) => b.similarity - a.similarity) // For numeric values
          // .sort((a, b) => a.attributeName.localeCompare(b.attributeName)) // For strings
          .map((cityData) => (
            <CityWeatherGraph data={cityData} /> // Assuming each cityData has a unique 'id' attribute for React keys
        ))}
    </>
  );
}

export default App;
