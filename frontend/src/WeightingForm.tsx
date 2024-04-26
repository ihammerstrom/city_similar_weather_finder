import React from 'react';
import { weatherLabels } from './WeatherLabels';
import { IOption } from './OptionType';

export interface WeatherVariables {
  DISTANCE: number;
  SHIFTED: boolean;
}

interface WeightingFormProps {
  weatherVars: WeatherVariables;
  setWeatherVars: (updatedVars: WeatherVariables) => void;
  cityName: IOption | undefined;
  displayFahrenheit: boolean;
  setDisplayFahrenheit: (value: boolean) => void;
}

const WeightingForm: React.FC<WeightingFormProps> = ({ weatherVars, setWeatherVars, cityName, displayFahrenheit, setDisplayFahrenheit}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : parseInt(value);
    
    setWeatherVars({
      ...weatherVars,
      [name]: newValue,
    });
  };

  return (
    <>
      <form style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: '10px', alignItems: 'center', marginLeft: "5%", marginRight: "5%", marginTop: "10px" }}>
        <div>
          <label style={{ textAlign: 'right' }}>
            {weatherLabels['DISTANCE'] || 'Distance'}
          </label>
          <select
            name="DISTANCE"
            value={weatherVars.DISTANCE.toString()}
            onChange={handleChange}
            style={{ minWidth: '50px', maxWidth: '200px' }}
          >
            <option value="100">100km</option>
            <option value="200">200km</option>
            <option value="500">500km</option>
            <option value="1000">1000km</option>
          </select>
        </div>
        
        {/* New line for SHIFTED checkbox */}
        <div style={{ gridColumn: '1 / -1' }}> {/* This will extend the checkbox across the full width of the form */}
          <label>
            
            <input
              type="checkbox"
              name="SHIFTED"
              checked={weatherVars.SHIFTED}
              onChange={handleChange}
            />
            {weatherLabels['SHIFTED'] || 'Shift Seasons for Southern Hemisphere'}
          </label>
        </div>
        <div style={{ gridColumn: '1 / -1' }}> {/* This will extend the checkbox across the full width of the form */}
          <label>
            
            <input
              type="checkbox"
              checked={displayFahrenheit}
              onChange={(e) => setDisplayFahrenheit(e.target.checked)}
            />
            {" Check to display in Fahrenheit/inches (uncheck for Celcius/millimeters)"}
          </label>
        </div>
      </form>
    </>
  );
};

export default WeightingForm;
