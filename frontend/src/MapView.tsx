// MapView.tsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { CityWeatherData } from './CityWeatherData';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface MapViewProps {
  locations: CityWeatherData[];
  onCityClick: (cityName: string) => void;
}

// Fix marker icon not found issue after build
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapView: React.FC<MapViewProps> = ({ locations, onCityClick }) => {

  return (
    <MapContainer center={[locations[0].latitude, locations[0].longitude]} zoom={5} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((location, index) => (
        <CircleMarker
          key={index}
          center={[location.latitude, location.longitude]}
          radius={7}
          color={index == 0? 'blue': 'red'}
          eventHandlers={{
            click: () => {
              onCityClick(location.name);
            },
          }}
        >
          <Popup>{location.name}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};
  


export default MapView;
