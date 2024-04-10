import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Importing side effects for Chart.js 3
import { CityWeatherData } from './CityWeatherData';

interface CityWeatherGraphProps {
  data: CityWeatherData;
  backgroundData: CityWeatherData
}

const CityWeatherGraph: React.FC<CityWeatherGraphProps> = ({ data, backgroundData }) => {
  // Define the chart data
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: 'Average Temperature (°C)',
        data: data.TAVG,
        borderColor: 'rgb(255, 99, 132)', // Red
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y', // Assign to the first Y axis
      },
      {
        label: 'Precipitation (mm)',
        data: data.PRCP,
        borderColor: 'rgb(54, 162, 235)', // Blue
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        yAxisID: 'y1', // Assign to the second Y axis
      },
      {
        label: 'Snowfall (mm)',
        data: data.SNOW,
        borderColor: 'rgb(75, 192, 192)', // Green
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y1',
      },
      {
        label: 'Max Temperature (°C)',
        data: data.TMAX,
        borderColor: 'rgb(255, 205, 86)', // Yellow
        backgroundColor: 'rgba(255, 205, 86, 0.5)',
        yAxisID: 'y', // Assign to the first Y axis
      },
      {
        label: 'Min Temperature (°C)',
        data: data.TMIN,
        borderColor: 'rgb(153, 102, 255)', // Purple
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        yAxisID: 'y', // Assign to the first Y axis
      },
      {
        label: '(origin) Average Temperature (°C)',
        data: backgroundData.TAVG,
        borderColor: 'rgb(255, 99, 132, 0.1)', // Red
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        yAxisID: 'y', // Assign to the first Y axis
      },
      {
        label: '(origin) Precipitation (mm)',
        data: backgroundData.PRCP,
        borderColor: 'rgb(54, 162, 235, 0.1)', // Blue
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        yAxisID: 'y1', // Assign to the second Y axis
      },
      {
        label: '(origin) Snowfall (mm)',
        data: backgroundData.SNOW,
        borderColor: 'rgb(75, 192, 192, 0.1)', // Green
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        yAxisID: 'y1',
      },
      {
        label: '(origin) Max Temperature (°C)',
        data: backgroundData.TMAX,
        borderColor: 'rgb(255, 205, 86, 0.1)', // Yellow
        backgroundColor: 'rgba(255, 205, 86, 0.1)',
        yAxisID: 'y', // Assign to the first Y axis
      },
      {
        label: '(origin) Min Temperature (°C)',
        data: backgroundData.TMIN,
        borderColor: 'rgb(153, 102, 255, 0.1)', // Purple
        backgroundColor: 'rgba(153, 102, 255, 0.1)',
        yAxisID: 'y', // Assign to the first Y axis
      },


    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: `${data.name} ${data.similarity.toPrecision(5)}`, // Use city name as chart title
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Line data={chartData} options={options} />
  );
};

export default CityWeatherGraph;
