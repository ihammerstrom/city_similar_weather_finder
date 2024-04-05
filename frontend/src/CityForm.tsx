import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { API_URL } from './config';
import { IOption } from './OptionType';
import AsyncSelect from 'react-select/async';
import { ActionMeta, SingleValue } from 'react-select';

interface IProps {
  // loadOptions: (inputValue: string) => Promise<IOption[]>;
  handleChange: (newValue: SingleValue<IOption>, actionMeta: ActionMeta<IOption>) => void;
}

const AutocompleteForm: React.FC<IProps> = ( { handleChange } ) => {

  // const [suggestions, setSuggestions] = useState<String[]>([]);

  
  const fetchOptions = async (inputCity: string): Promise<IOption[]> => {
    try {
      if (inputCity.length > 0 && inputCity.charAt(0).match(/[a-z]/i)){
        const response = await fetch(`${API_URL}/autocomplete_city_name?city_name_substring=${inputCity}`);
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



  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   // Make API call to send selected city
  //   try {
  //     const response = await fetch('https://yourapi.com/sendCity', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ city }),
  //     });
  //     const data = await response.json();
  //     console.log('Response from sending city:', data);
  //     // Reset the form after successful submission
  //     setCity('');
  //     setSuggestions([]);
  //   } catch (error) {
  //     console.error('Error sending city:', error);
  //   }
  // };

  return (
    <Container>
      <h1>Enter a City</h1>
      <AsyncSelect
        loadOptions={fetchOptions}
        onChange={handleChange}
      />
      <Button variant="primary" type="submit">
        Submit
      </Button>
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


      