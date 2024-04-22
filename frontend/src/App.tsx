import React, { useEffect, useState } from 'react';
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
  const [selectedCity, setSelectedCity] = useState<IOption | undefined>();
  const [mapCityName, setMapCityName] = useState<IOption | undefined>();
  const [similarCities, setSimilarCities] = useState<CityWeatherData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [weatherOptions, setWeatherOptions] = useState<WeatherVariables>({
    DISTANCE: 200,
  });

  const fetchCityData = async (citySelected: IOption | undefined) => {
    try {
      console.log('selectedCity is:', citySelected)
      if (citySelected != null){
        const params = {
          'geoname_id': citySelected.value,
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
        console.log(`Response from sending city ${citySelected}:`, data);

        // set the similar cities response, sorting on similarity
        setSimilarCities(data['cities'].sort((a: { similarity: number; }, b: { similarity: number; }) => b.similarity - a.similarity))
        setMapCityName(citySelected)
      }else{
        console.log("selected city is null, not fetching")
      }
    } catch (error) {
      console.error('Error sending city:', error);
      alert("Error calling API, please call/text Ian at 206.659.7233 to get him to fix it.")
    }
  };


  useEffect(() => {
    console.log('mapcity Data updated:', mapCityName);
    console.log(mapCityName)
    console.log(similarCities)
    console.log(similarCities.find(city => city.geoname_id == mapCityName?.value))
  }, [mapCityName, similarCities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(`submitting ${selectedCity}`)
    fetchCityData(selectedCity)
  };

  const handleCityChange = (
    newValue: SingleValue<IOption>,
    actionMeta: ActionMeta<IOption>
  ) => {
    // Assuming you want to update the state based on the value of the selected option
    const selectedCityName = newValue ? newValue : undefined;
    console.log(`setting city name to ${selectedCityName}`)
    setSelectedCity(selectedCityName)
  };
  
  const handleMapCityClick = (cityName: IOption): void => {
    console.log(`clicked on ${cityName}`)
    setMapCityName(cityName);
  };


  return (
    
    <>
          {/* <LoadingBlock isLoading={isLoading}/> */}

      {similarCities?.length > 0 &&
        <>
          <h2 style={{textAlign: 'center'}}>
            Top {similarCities.length} similar cities:
          </h2>
          <CityWeatherGraph data={similarCities.find(city => city.geoname_id == mapCityName?.value)!} backgroundData={similarCities[0]}/>
          <h3 style={{textAlign: 'center', margin: '10px', marginLeft: "5%", marginRight: "5%"}}>Click a city below to compare it with the reference city:</h3>
          <MapView locations={similarCities} onCityClick={handleMapCityClick} />
        </>
      }
      <h1 style={{ textAlign: 'center' }}>Find cities with a climate similar to...</h1>

      <div style={{ marginRight: '10%', marginLeft: '10%'}}>
        <CityForm handleChange={handleCityChange}/>
      </div>
      <WeightingForm 
        weatherVars={weatherOptions} 
        setWeatherVars={setWeatherOptions} 
        handleSubmit={handleSubmit} 
        cityName={selectedCity}
      />


<div style={{textAlign: 'center', fontSize: '13px', color: 'grey', marginTop:'30px', marginBottom:'15px' }}>Note: climate data may be several degrees off in some areas, but can still be used for fairly reliable comparison. Only cities with populations greater than 100,000 included. Contact: <a style={{color: 'grey'}} href="mailto:ihammerstrom@icloud.com">ihammerstrom@icloud.com </a></div>

    </>
  );
}


export default App;
