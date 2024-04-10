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
      if (inputCitySubStr.length > 1 && inputCitySubStr.charAt(0).match(/[a-z]/i)){ //make sure first character is alphabetic
        const response = await fetch(`${API_URL}/autocomplete_city_name?city_name_substring=${inputCitySubStr}`);
        const data = await response.json();
        return data.suggestions.map((item: any) => ({
          label: item,
          value: item, 
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
      <h1 style={{textAlign: 'center'}}>Find cities in the US/Canada with a climate similar to...</h1>
      <form>
      <AsyncSelect
        loadOptions={fetchOptions}
        onChange={handleChange}
      />
    </form>
    </Container>
  );
};


export default AutocompleteForm;

      