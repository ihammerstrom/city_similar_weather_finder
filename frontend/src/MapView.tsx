import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { CityWeatherData } from './CityWeatherData';
import { IOption } from './OptionType';

interface MapViewProps {
  locations: CityWeatherData[];
  onCityClick: (cityName: IOption) => void;
}


// Fix marker icon not found issue after build
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapView: React.FC<MapViewProps> = ({ locations, onCityClick }) => {
//   const mapRef = useRef(null);

//   // Function to reset map view
//   const ResetMapView = () => {
//     const map = useMap();
//     useEffect(() => {
//       console.log("resetmapview:")
//       console.log(locations[0]?.name)
//             map.setView([20, 0], 2); // Resets the map to a default view
//     }, [locations[0]?.name, map]); // Dependencies include the current name, map instance, and previous name
//     return null; // This component does not render anything
// };

  return (
    <MapContainer
      center={[20, 0]}  // Initial world view center
      zoom={2}  // Initial zoom level
      minZoom={2}  // Minimum zoom level to prevent zooming out too far
      maxZoom={6}  // Maximum zoom level
      style={{ height: '400px', width: '100%' }}
    >

      {/* <ResetMapView />  // Use the ResetMapView component to control the map view */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((location, index) => {
        const icon = L.divIcon({
          html: `<div style="background-color: ${index === 0 ? 'blue' : 'red'}; color: white; font-size: 12px; width: 20px; height: 20px; text-align: center; line-height: 20px; border-radius: 50%;">${index + 1}</div>`,
          className: '',
          iconSize: [20, 20]
        });

        return (
          <Marker
            key={index}
            position={[location.latitude, location.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => {
                onCityClick({
                  label: location.name,
                  value: location.geoname_id
                });
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
