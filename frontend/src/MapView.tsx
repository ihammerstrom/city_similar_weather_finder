// MapView.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { CityWeatherData } from './CityWeatherData';

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
      {locations.map((location, index) => {
        const icon = L.divIcon({
          html: `<div style="background-color: ${index === 0 ? 'blue' : 'red'}; color: white; font-size: 12px; width: 20px; height: 20px; text-align: center; line-height: 20px; border-radius: 50%;">${index + 1}</div>`,
          className: '', // Removes extra padding and borders
          iconSize: [20, 20]
        });

        return (
          <Marker
            key={index}
            position={[location.latitude, location.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => {
                onCityClick(location.name);
              },
            }}
          >
            <Popup>{location.name}</Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;
