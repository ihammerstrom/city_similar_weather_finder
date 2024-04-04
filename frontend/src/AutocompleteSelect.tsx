import React from 'react';
import AsyncSelect from 'react-select/async';
import { IOption } from './OptionType';

interface IProps {
  loadOptions: (inputValue: string) => Promise<IOption[]>;
}

export const AutocompleteSelect: React.FC<IProps> = ({ loadOptions }) => {
  return (
    <AsyncSelect
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions
    />
  );
};
