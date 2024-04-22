import React from 'react';
import { weatherLabels } from './WeatherLabels';
import { IOption } from './OptionType';

export interface WeatherVariables {
  // TAVG: number;
  // TMAX: number;
  // TMIN: number;
  // PRCP: number;
  DISTANCE: number;
}

interface WeightingFormProps {
  weatherVars: WeatherVariables;
  setWeatherVars: (updatedVars: WeatherVariables) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  cityName: IOption | undefined;
}

const WeightingForm: React.FC<WeightingFormProps> = ({ weatherVars, setWeatherVars, handleSubmit, cityName }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Only parse the value as an integer for the range inputs
    const isRangeInput = e.target.type === 'range';
    setWeatherVars({
      DISTANCE: parseInt(value),
    });
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* <h3 style={{ marginLeft: "5%", marginTop: "30px" }}>
        Minimum distance between similar cities:
      </h3> */}
      <div style={{ marginLeft: "5%", marginBottom: "20px" }}>
        {/* <div style={{ color: "#777777" }}>
          This optional step allows you to adjust how important each climate component (e.g., Precipitation, Maximum Temperature) will be to calculating city similarity.
          <br />
          For example, set Precipitation to 0x if you don't want it to be considered, or increase it to 3x to triple its influence on the similarity calculation.
        </div> */}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: '10px', alignItems: 'center', marginLeft: "5%", marginRight: "5%", marginTop: "10px" }}>
        {Object.keys(weatherVars).map((key) => (
          <React.Fragment key={key}>
            <label style={{ textAlign: 'right' }}>
              {weatherLabels[key]}
            </label>
            {/* //: {weatherVars[key as keyof WeatherVariables]}{key === "DISTANCE" ? ' km' : 'x'} */}
              <select
                name={key}
                value={weatherVars[key as keyof WeatherVariables].toString()}
                onChange={handleChange} // Correctly handle changes
                style={{minWidth: '100px'}}
              >
                <option value="100">100km</option>
                <option value="200">200km</option>
                <option value="500">500km</option>
                <option value="1000">1000km</option>
              </select>
            
          </React.Fragment>
        ))}
        <button disabled={cityName === undefined || cityName.label.length === 0} type="submit" style={{ gridColumn: '2', marginTop: '20px' }}>Submit</button>
      </form>
    </div>
  );
};

export default WeightingForm;
