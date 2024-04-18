import React, { useState } from 'react';
import './App.css';
import CityForm from './CityForm';
import { IOption } from './OptionType';
import { API_URL } from './config';
import { CityWeatherData } from './CityWeatherData';
import CityWeatherGraph from './CityWeatherGraph';
import MapView from './MapView';
import LoadingBlock from './LoadingBlock';
import WeightingForm, { WeatherVariables } from './WeightingForm';
import { ActionMeta, SingleValue } from 'react-select';



function App() {
  const [cityName, setCityName] = useState<string | undefined>('');
  const [mapCityName, setMapCityName] = useState<string | undefined>('');
  const [similarCities, setSimilarCities] = useState<CityWeatherData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [weatherOptions, setWeatherOptions] = useState<WeatherVariables>({
    TAVG: 1,
    TMAX: 1,
    TMIN: 1,
    PRCP: 1,
    DISTANCE: 200,
  });

  const fetchCityData = async (selectedCity: string | undefined) => {
    try {
      if (selectedCity != null){

        const params = {
          'city_name': selectedCity,
          'TAVG': weatherOptions['TAVG'],
          'TMAX': weatherOptions['TMAX'],
          'TMIN': weatherOptions['TMIN'],
          'PRCP': weatherOptions['PRCP'],
          'min_distance': weatherOptions['DISTANCE'],
        };
        // construct query string of options
        const queryString = Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        setIsLoading(true)
        const response = await fetch(`${API_URL}/get_similar_cities?${queryString}`);
        const data = await response.json();
        setIsLoading(false)
        console.log(`Response from sending city ${selectedCity}:`, data);
        // set the similar cities response, sorting on similarity
        setSimilarCities(data['cities'].sort((a: { similarity: number; }, b: { similarity: number; }) => b.similarity - a.similarity))
        setMapCityName(selectedCity)
      }else{
        console.log("selected city is null, not fetching")
      }
    } catch (error) {
      console.error('Error sending city:', error);
      alert("Error calling API, please call/text Ian at 206.659.7233 to get him to fix it.")
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
      <div style={{ marginRight: '10%', marginLeft: '10%'}}>
        <CityForm handleChange={handleCityChange}/>
      </div>
      <WeightingForm 
        weatherVars={weatherOptions} 
        setWeatherVars={setWeatherOptions} 
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
          <div style={{textAlign: 'center', margin: '10px', marginLeft: "5%", marginRight: "5%"}}>Click a city below to compare it with the reference city. The cities are numbered from 1-{similarCities.length} in order of their similarity to the reference city, with 1 being the reference city, 2 being the most similar, and 20 being the least similar.</div>
          <MapView locations={similarCities} onCityClick={handleMapCityClick} />
          <div style={{textAlign: 'center', fontSize: '13px', color: 'grey', marginTop:'15px', marginBottom:'15px' }}>Note: climate data may be several degrees off in some areas, but can still be used for fairly reliable comparison. Only cities with populations greater than 100,000 included. Contact: <a style={{color: 'grey'}} href="mailto:ihammerstrom@icloud.com">ihammerstrom@icloud.com </a></div>
        </>
        }
        
    </>
  );
}


export default App;
