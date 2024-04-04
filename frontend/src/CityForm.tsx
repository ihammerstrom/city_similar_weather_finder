import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { API_URL } from './config';
import { AutocompleteSelect } from './AutocompleteSelect';
import { IOption } from './OptionType';

interface City {
  name: string;
  // Add more properties as needed
}

const AutocompleteForm: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [suggestions, setSuggestions] = useState<String[]>([]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputCity = e.target.value;
    setCity(inputCity);
    // console.log("made change")
    // Make API call to autocomplete API
    try {
      const response = await fetch(`${API_URL}/autocomplete_city_name?city_name_substring=${inputCity}`);
      const data = await response.json();
      console.log(data.suggestions)
      setSuggestions(data.suggestions); // Assuming results are an array of city suggestions
      // console.log("suggestions")
      // console.log(suggestions)
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
    }
  };

  
  const fetchOptions = async (inputCity: string): Promise<IOption[]> => {
    const response = await fetch(`${API_URL}/autocomplete_city_name?city_name_substring=${inputCity}`);
    const data = await response.json();
    return data.suggestions.map((item: any) => ({
      label: item, // Adjust based on your API response
      value: item,   // Adjust based on your API response
    }));
  };
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Make API call to send selected city
    try {
      const response = await fetch('https://yourapi.com/sendCity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city }),
      });
      const data = await response.json();
      console.log('Response from sending city:', data);
      // Reset the form after successful submission
      setCity('');
      setSuggestions([]);
    } catch (error) {
      console.error('Error sending city:', error);
    }
  };

  return (
    <Container>
      <h1>Enter a City</h1>
      <AutocompleteSelect loadOptions={fetchOptions} />;
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