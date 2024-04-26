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
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const [weatherOptions, setWeatherOptions] = useState<WeatherVariables>({
    DISTANCE: 200,
    SHIFTED: true,
  });
  const [key, setKey] = useState(0); // use to force map rerender
  const [displayFahrenheit, setDisplayFahrenheit] = useState<boolean>(true);

  const fetchCityData = async (citySelected: IOption | undefined) => {
    try {
      if (citySelected != null){
        const params = {
          'geoname_id': citySelected.value,
          'min_distance': weatherOptions['DISTANCE'],
          'shift_southern_hemisphere_climate': weatherOptions['SHIFTED']
        };
        // construct query string of options
        const queryString = Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        const response = await fetch(`${API_URL}/get_similar_cities?${queryString}`);
        const data = await response.json();

        // set the similar cities response, sorting on similarity
        setSimilarCities(data['cities'].sort((a: CityWeatherData, b: CityWeatherData) => {
          // Check if 'a' is the citySelected
          if (a.name === citySelected.label) return -1;
          // Check if 'b' is the citySelected
          if (b.name === citySelected.label) return 1;
          // Otherwise, sort normally by similarity
          return b.similarity - a.similarity;
        }));

        setMapCityName(citySelected);
      }else{
        console.log("selected city is null, not fetching")
      }
    } catch (error) {
      console.error('Error sending city:', error);
      alert("Error calling API, please call/text Ian at 206.659.7233 to get him to fix it.")
    }
  };

  const reloadMap = () => {
    setKey(prevKey => prevKey + 1);  // Increment key to force re-render
  };

  useEffect(() => {
    fetchCityData(selectedCity)
    reloadMap()
  }, [selectedCity, weatherOptions]);

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   console.log(`submitting ${selectedCity}`)
  //   fetchCityData(selectedCity)
  // };

  const handleCityChange = (
    newValue: SingleValue<IOption>,
    actionMeta: ActionMeta<IOption>
  ) => {
    // Assuming you want to update the state based on the value of the selected option
    const selectedCityName = newValue ? newValue : undefined;
    setSelectedCity(selectedCityName)
  };
  
  const handleMapCityClick = (cityName: IOption): void => {
    setMapCityName(cityName);
  };


  return (
    
    <>
      {similarCities?.length > 0 &&
        <>
          <h2 style={{textAlign: 'center'}}>
            Top {similarCities.length} similar cities to {selectedCity?.label}
          </h2>
          <CityWeatherGraph data={similarCities.find(city => city.geoname_id == mapCityName?.value)!} backgroundData={similarCities[0]} shifting={weatherOptions.SHIFTED} displayFahrenheit={displayFahrenheit}/>
          <h3 style={{textAlign: 'center', margin: '10px', marginLeft: "5%", marginRight: "5%"}}>Click a city below to compare it above with the reference city:</h3>
          <div style={{textAlign: 'center', fontSize: '16px', color: 'grey', marginTop:'10px', marginBottom:'16px' }}> Cities are ranked by similarity from 1 to {similarCities.length} </div>

          <MapView key={key} locations={similarCities} onCityClick={handleMapCityClick} />
        </>
      }
      <div style={{ maxWidth: "1075px", margin: "0 auto" }}>
          <h1 style={{ textAlign: 'center', marginLeft: '10px', marginRight: '10px' }}>Find cities around the world with a climate similar to...</h1>
          <div style={{ marginRight: '10%', marginLeft: '10%'}}>
            <CityForm handleChange={handleCityChange}/>
            <div style={{marginTop: '20px'}}>
              <WeightingForm 
                weatherVars={weatherOptions} 
                setWeatherVars={setWeatherOptions} 
                cityName={selectedCity}
                displayFahrenheit={displayFahrenheit}
                setDisplayFahrenheit={setDisplayFahrenheit}
              />
            </div>
          </div>

      </div>

      {similarCities?.length > 0 &&
        <div style={{textAlign: 'center', fontSize: '13px', color: 'grey', marginTop:'150px', marginBottom:'15px', marginLeft: '3%', marginRight: '3%' }}>Note: climate data may be several degrees off in some areas, but can still be used for fairly reliable comparison. Only includes cities with populations greater than 50,000 people. Contact: <a style={{color: 'grey'}} href="mailto:ihammerstrom@icloud.com">ihammerstrom@icloud.com </a></div>
      }
    </>
  );
}


export default App;
