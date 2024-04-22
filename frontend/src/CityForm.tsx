import React from 'react';
import { Container } from 'react-bootstrap';
import { API_URL } from './config';
import { IOption } from './OptionType';
import AsyncSelect from 'react-select/async';
import { ActionMeta, SingleValue } from 'react-select';

interface IProps {
  handleChange: (newValue: SingleValue<IOption>, actionMeta: ActionMeta<IOption>) => void;
}

const AutocompleteForm: React.FC<IProps> = ( { handleChange } ) => {  
  const fetchOptions = async (inputCitySubStr: string): Promise<IOption[]> => {
    try {
      if (inputCitySubStr.length > 1 && /^[a-zA-Z]/.test(inputCitySubStr)) { // Ensure first character is alphabetic
        const response = await fetch(`${API_URL}/autocomplete_city_name?city_name_substring=${inputCitySubStr}`);
        const data = await response.json();
        return data.map((item: { label: string, value: string }) => ({
          label: item.label, // Display name of the city
          value: item.value, // Internal unique identifier for the city
        }));
    }
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
      alert("Error calling API, please call/text Ian at 206.659.7233 to get him to fix it.")
    }
    return []
  };

  return (
      <Container>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ marginRight: '10px' }}>Enter city here:</div>
          <form style={{ flex: 1, minWidth: '200px'}}>
            <AsyncSelect
              loadOptions={fetchOptions}
              onChange={handleChange}
              defaultOptions
            />
          </form>
        </div>
      </Container>
  );
};


export default AutocompleteForm;

      