import React from 'react';
import { weatherLabels } from './WeatherLabels';

export interface WeatherVariables {
  TAVG: number;
  TMAX: number;
  TMIN: number;
  PRCP: number;
  SNOW: number;
  DISTANCE: number;
}

interface WeightingFormProps {
  weatherVars: WeatherVariables;
  setWeatherVars: (updatedVars: WeatherVariables) => void;
  handleSubmit: (e: React.FormEvent) => void; // New prop for handling form submission
  cityName: string | undefined
}

const WeightingForm: React.FC<WeightingFormProps> = ({ weatherVars, setWeatherVars, handleSubmit, cityName }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWeatherVars({
      ...weatherVars,
      [name]: parseInt(value, 10),
    });
  };

  return (
    <>
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h3 style={{marginLeft: "5%", marginTop: "30px" }}> (Optional) Configure the weighting multiplier / minimum distance between cities: </h3>
        <div style={{marginLeft: "5%", marginBottom: "20px"}}> 
        This optional step allows you to adjust the algorithm's weighting for each weather component (e.g., Precipitation, Maximum Temperature) to better match your preferences.
        <br/>
        For example, set Precipitation to 0x if you don't want it to be considered, or increase it to 3x to triple its influence on the similarity calculation.
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: '10px', alignItems: 'center', marginLeft: "5%", marginRight: "5%", marginTop: "10px" }}>
        {Object.keys(weatherVars).map(key => (
            <React.Fragment key={key}>
            <label style={{ textAlign: 'right' }}>
                {weatherLabels[key]}: {weatherVars[key as keyof WeatherVariables]}{key != "DISTANCE" && 'x'}
            </label>
            <input
                type="range"
                name={key}
                value={weatherVars[key as keyof WeatherVariables]}
                onChange={handleChange}
                min="0"
                max={key != "DISTANCE"? "5" : "1000"}
                step={key != "DISTANCE"? "1" : "10"}
            />
            </React.Fragment>
        ))}
        <button disabled={cityName == undefined || cityName.length == 0} type="submit" style={{ gridColumn: '2', marginTop: '20px' }}>Submit</button>
        </form>
    </div>
    </>
  );
};

export default WeightingForm;
