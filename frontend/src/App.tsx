import React, { useState } from 'react';
// import logo from './logo.svg';
import './App.css';
// import Button from 'react-bootstrap/Button';
import CityForm from './CityForm';
import { IOption } from './OptionType';
import { API_URL } from './config';
import { CityWeatherData } from './CityWeatherData';
import CityWeatherGraph from './CityWeatherGraph';
import MapView from './MapView';
import { map } from 'leaflet';
import LoadingBlock from './LoadingBlock';
import WeightingForm, { WeatherVariables } from './WeightingForm';
import { ActionMeta, SingleValue } from 'react-select';

// interface IProps {
//   handleChange: (newValue: SingleValue<IOption>, actionMeta: ActionMeta<IOption>) => void;
// }

 // Define the top-level structure to hold all city data


function App() {
  const [cityName, setCityName] = useState<string | undefined>('');
  const [mapCityName, setMapCityName] = useState<string | undefined>('');
  const [similarCities, setSimilarCities] = useState<CityWeatherData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [weatherWeights, setWeatherWeights] = useState<WeatherVariables>({
    TAVG: 1,
    TMAX: 1,
    TMIN: 1,
    PRCP: 1,
    SNOW: 1,
  });

  const fetchCityData = async (selectedCity: string | undefined) => {
    // Make API call to send selected city
    try {
      if (selectedCity != null){
        setIsLoading(true)
        const response = await fetch(`${API_URL}/get_similar_cities?city_name=${selectedCity}`);
        const data = await response.json();
        setIsLoading(false)
        console.log(`Response from sending city ${selectedCity}:`, data);
        setSimilarCities(data['cities'].slice().sort((a: { similarity: number; }, b: { similarity: number; }) => b.similarity - a.similarity))
        setMapCityName(selectedCity)
      }else{
        console.log("selected city is null")
      }
    } catch (error) {
      console.error('Error sending city:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(`submitting ${cityName}`)
    fetchCityData(cityName)
  };

  const handleCityChange = (
    newValue: SingleValue<IOption>,
    actionMeta: ActionMeta<IOption>
  ) => {
    // Assuming you want to update the state based on the value of the selected option
    const selectedCityName = newValue ? newValue.value : undefined;
    console.log(`setting city name to ${selectedCityName}`)
    setCityName(selectedCityName)
  };

  
  const handleMapCityClick = (cityName: string): void => {
    console.log(`clicked on ${cityName}`)
    setMapCityName(cityName);
  };


  return (
    <>
      <div style={{ marginRight: '10%', marginLeft: '10%'}}> {/* Add some spacing between the components */}
        <CityForm handleChange={handleCityChange}/>
      </div>
      <WeightingForm 
        weatherVars={weatherWeights} 
        setWeatherVars={setWeatherWeights} 
        handleSubmit={handleSubmit} 
        cityName={cityName}
      />
        <LoadingBlock isLoading={isLoading}/>

        {similarCities?.length > 0 &&
        <>
          <h2 style={{textAlign: 'center'}}>
            Top {similarCities.length} similar cities:
          </h2>
          <CityWeatherGraph data={similarCities.find(city => city.name === mapCityName)!} backgroundData={similarCities[0]}/>
          <MapView locations={similarCities} onCityClick={handleMapCityClick} />
        </>
        }
    </>
  );
}


// const HorizontalLine = () => (
//   <div style={{ borderTop: "3px solid #000", margin: "30px 0" }}></div>
// );

export default App;
