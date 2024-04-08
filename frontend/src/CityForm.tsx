import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { API_URL } from './config';
import { IOption } from './OptionType';
import AsyncSelect from 'react-select/async';
import { ActionMeta, SingleValue } from 'react-select';

interface IProps {
  handleChange: (newValue: SingleValue<IOption>, actionMeta: ActionMeta<IOption>) => void;
  // handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const AutocompleteForm: React.FC<IProps> = ( { handleChange } ) => {  
  const fetchOptions = async (inputCitySubStr: string): Promise<IOption[]> => {
    try {
      if (inputCitySubStr.length > 1 && inputCitySubStr.charAt(0).match(/[a-z]/i)){
        const response = await fetch(`${API_URL}/autocomplete_city_name?city_name_substring=${inputCitySubStr}`);
        const data = await response.json();
        return data.suggestions.map((item: any) => ({
          label: item, // Adjust based on your API response
          value: item,   // Adjust based on your API response
        }));
      }
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
    }
    return []
  };

// Example function that will be called with the selected value



  return (
    <Container>
      <h1 style={{textAlign: 'center'}}>Find US cities with weather similar to...</h1>
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
      // // {/* <Form onSubmit={handleSubmit}>
      // //   <Form.Group controlId="city">
      // //     <Form.Label>City</Form.Label>
      // //     <Form.Control
      // //       type="text"
      // //       placeholder="Enter city"
      // //       value={city}
      // //       onChange={handleChange}
      // //     />
      // //     {/* <Form.Text className="text-muted">
      // //       Suggestions: {suggestions?.map((city) => city.name).join(', ')}
      // //     </Form.Text> */}
      //     </Form.Group>
      //     <Button variant="primary" type="submit">
      //       Submit
      //     </Button>
      //   </Form>
      //   <ul>
      //     {suggestions.map((city, index) => (
      //       <li key={index}>{city}</li>
      //     ))}
      //   </ul> */}


      