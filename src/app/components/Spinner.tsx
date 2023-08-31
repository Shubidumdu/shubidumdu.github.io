import React from 'react';
import BarLoader from 'react-spinners/BarLoader';
import { type LoaderSizeProps } from 'react-spinners/helpers/props';

type SpinnerProps = {
  isLoading: boolean;
};

const SPINNER_OPTIONS: LoaderSizeProps = {
  color: '#e4f6ff',
  cssOverride: {
    margin: 'auto',
    width: '100%',
  },
};

const Spinner = ({ isLoading }: SpinnerProps) => {
  return (
    <BarLoader
      {...SPINNER_OPTIONS}
      className="w-full"
      loading={isLoading}
      aria-label="Loading Spinner"
    />
  );
};

export default Spinner;
