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

// interface IProps {
//   handleChange: (newValue: SingleValue<IOption>, actionMeta: ActionMeta<IOption>) => void;
// }

 // Define the top-level structure to hold all city data

function App() {
  const [cityName, setCityName] = useState<string | undefined>('');
  const [mapCityName, setMapCityName] = useState<string | undefined>('');
  const [similarCities, setSimilarCities] = useState<CityWeatherData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const fetchCityData = async (selectedCity: IOption | null) => {
    // Make API call to send selected city
    try {
      console.log(selectedCity?.value)
      if (selectedCity != null){
        setIsLoading(true)
        const cityName = selectedCity?.value
        const response = await fetch(`${API_URL}/get_similar_cities?city_name=${cityName}`);
        const data = await response.json();
        setIsLoading(false)
        console.log(`Response from sending city ${cityName}:`, data);
        setSimilarCities(data['cities'].slice().sort((a: { similarity: number; }, b: { similarity: number; }) => b.similarity - a.similarity))
        setCityName(cityName)
        setMapCityName(cityName)
      }
    } catch (error) {
      console.error('Error sending city:', error);
    }
  };
  
  const handleCityClick = (cityName: string): void => {
    console.log(`clicked on ${cityName}`)
    setMapCityName(cityName);
  };


  return (
    <>
      <div style={{ marginRight: '10%', marginLeft: '10%'}}> {/* Add some spacing between the components */}
        <CityForm handleChange={fetchCityData}/>
      </div>

        <LoadingBlock isLoading={isLoading}/>

        {similarCities?.length > 0 &&
        <>
          <h2 style={{textAlign: 'center'}}>
            Top {similarCities.length} similar cities:
          </h2>
          <CityWeatherGraph data={similarCities.find(city => city.name === mapCityName)!} backgroundData={similarCities[0]}/>
          <MapView locations={similarCities} onCityClick={handleCityClick} />
        </>
        }
    </>
  );
}


// const HorizontalLine = () => (
//   <div style={{ borderTop: "3px solid #000", margin: "30px 0" }}></div>
// );

export default App;
