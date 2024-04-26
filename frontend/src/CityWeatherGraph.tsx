import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Importing side effects for Chart.js 3
import { CityWeatherData } from './CityWeatherData';
import { ChartOptions } from 'chart.js';


interface CityWeatherGraphProps {
  data: CityWeatherData;
  backgroundData: CityWeatherData;
  shifting: boolean;
}

function adjustMonth(value: string | number): number {
  // Convert the input value to a number if it's a string, then apply the calculation
  return (Number(value) + 6) % 12;
}

function rotateArray<T>(array: T[], shift: number): T[] {
  // Ensure the shift is within the length of the array
  shift = shift % array.length;
  // Take the last 'shift' elements and concatenate them with the rest of the array
  return array.slice(-shift).concat(array.slice(0, -shift));
}

function rotateArraySixIfSouthernHemisphere<T>(array: T[], southernHem: string): T[] {
  if (southernHem == "S"){
    return rotateArray(array, 6)
  } else {
    return array
  }
}


function processCity(city: CityWeatherData): CityWeatherData {
  const city_copy = structuredClone(city);
  city_copy.PRCP = rotateArraySixIfSouthernHemisphere(city_copy.TMAX, city_copy.hemisphere)
  city_copy.TAVG = rotateArraySixIfSouthernHemisphere(city_copy.TAVG, city_copy.hemisphere)
  city_copy.TMAX = rotateArraySixIfSouthernHemisphere(city_copy.TMAX, city_copy.hemisphere)
  city_copy.TMIN = rotateArraySixIfSouthernHemisphere(city_copy.TMIN, city_copy.hemisphere)
  return city_copy
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const CityWeatherGraph: React.FC<CityWeatherGraphProps> = ({ data, backgroundData, shifting }) => {
  const [myCity, setmyCity] = useState<CityWeatherData>();
  const [myBackgroundCity, setmyBackgroundCity] = useState<CityWeatherData>();

  useEffect(() => {
    if(shifting){
      setmyCity(processCity(data))
      setmyBackgroundCity(processCity(backgroundData))
    } else { 
      setmyCity(data)
      setmyBackgroundCity(backgroundData)
    }

  }, [data, backgroundData, shifting]);

  // Define the chart data
  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Average Temperature (°C)',
        data: myCity?.TAVG,
        borderColor: 'rgb(255, 99, 132)', // Red
        backgroundColor: 'rgba(255, 99, 132, 0.15)',
        yAxisID: 'y', // Assign to the first Y axis
      },
      {
        label: 'Precipitation (mm)',
        data: myCity?.PRCP,
        borderColor: 'rgb(54, 162, 235)', // Blue
        backgroundColor: 'rgba(54, 162, 235, 0.15)',
        yAxisID: 'y1', // Assign to the second Y axis
      },
      {
        label: 'Max Temperature (°C)',
        data: myCity?.TMAX,
        borderColor: 'rgb(255, 205, 86)', // Yellow
        backgroundColor: 'rgba(255, 205, 86, 0.15)',
        yAxisID: 'y', // Assign to the first Y axis
      },
      {
        label: 'Min Temperature (°C)',
        data: myCity?.TMIN,
        borderColor: 'rgb(153, 102, 255)', // Purple
        backgroundColor: 'rgba(153, 102, 255, 0.15)',
        yAxisID: 'y', // Assign to the first Y axis
      },
      {
        label: '(origin) Average Temperature (°C)',
        data: myBackgroundCity?.TAVG,
        borderColor: 'rgb(255, 99, 132, 0.15)', // Red
        backgroundColor: 'rgba(255, 99, 132, 0.4)',
        yAxisID: 'y', // Assign to the first Y axis
      },
      {
        label: '(origin) Precipitation (mm)',
        data: myBackgroundCity?.PRCP,
        borderColor: 'rgb(54, 162, 235, 0.15)', // Blue
        backgroundColor: 'rgba(54, 162, 235, 0.4)',
        yAxisID: 'y1', // Assign to the second Y axis
      },
      {
        label: '(origin) Max Temperature (°C)',
        data: myBackgroundCity?.TMAX,
        borderColor: 'rgb(255, 205, 86, 0.15)', // Yellow
        backgroundColor: 'rgba(255, 205, 86, 0.4)',
        yAxisID: 'y', // Assign to the first Y axis
      },
      {
        label: '(origin) Min Temperature (°C)',
        data: myCity?.TMIN,
        borderColor: 'rgb(153, 102, 255, 0.15)', // Purple
        backgroundColor: 'rgba(153, 102, 255, 0.4)',
        yAxisID: 'y', // Assign to the first Y axis
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    plugins: {
      title: {
        display: true,
        text: `${data.name}${backgroundData.name !== data.name ? ` vs ${backgroundData.name}` : ''}`, // Use city name as chart title
      },
    },
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        position: 'bottom', // Default x-axis at the bottom
        ticks: {
          callback: function(value) {
            if (myCity?.hemisphere == "S" && shifting){
              return months[adjustMonth(value)] //shift label
            }else{
              return months[Number(value)]
            }
          }
        }
      },
      xTop: { // Creating a new x-axis that will be displayed on top
        type: 'category', // Specify the type if needed, default is 'category' for line charts
        position: 'top',
        display: true,
        labels: chartData.labels, // Reuse the same labels from the main x-axis
        ticks: {
          callback: function(value) {
            if (myBackgroundCity?.hemisphere == "S" && shifting) {
              return months[adjustMonth(value)] //shift label
            } else {
              return months[Number(value)]
            }
          }
        }
      }
    },
  };



  

  return (
    <div style={{height: '500px'}}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CityWeatherGraph;
