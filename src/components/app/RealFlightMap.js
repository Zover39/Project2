import { useEffect } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';

const ASTANA = [51.0278, 71.4669];

function FitRoutes({ destinations }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds([ASTANA, ...destinations.map(route => route.position)], { padding: [28, 28] });
  }, [destinations, map]);

  return null;
}

export default function RealFlightMap({ routes, selectedCountry, onSelectCountry, formatMoney }) {
  return (
    <MapContainer
      center={[32, 75]}
      zoom={3}
      scrollWheelZoom={false}
      className="h-[320px] w-full sm:h-[390px]"
      aria-label="Интерактивная карта аэропортов и направлений"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitRoutes destinations={routes} />

      {routes.map(route => (
        <Polyline
          key={`route-${route.country}`}
          positions={[ASTANA, route.position]}
          pathOptions={{
            color: route.color,
            weight: selectedCountry === route.country ? 5 : 3,
            opacity: selectedCountry && selectedCountry !== route.country ? 0.3 : 0.8,
            dashArray: '8 8'
          }}
          eventHandlers={{ click: () => onSelectCountry(route.country) }}
        />
      ))}

      <CircleMarker
        center={ASTANA}
        radius={9}
        pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}
      >
        <Popup>
          <strong>Астана, Казахстан</strong><br />
          Международный аэропорт NQZ
        </Popup>
      </CircleMarker>

      {routes.map(route => (
        <CircleMarker
          key={route.country}
          center={route.position}
          radius={selectedCountry === route.country ? 10 : 7}
          pathOptions={{
            color: '#ffffff',
            weight: 2,
            fillColor: route.color,
            fillOpacity: selectedCountry && selectedCountry !== route.country ? 0.45 : 1
          }}
          eventHandlers={{ click: () => onSelectCountry(route.country) }}
        >
          <Popup>
            <div className="min-w-40">
              <p className="font-bold">{route.city}, {route.country}</p>
              <p className="text-xs text-slate-600">Аэропорт {route.airport}</p>
              <p className="mt-1 text-xs text-slate-600">Отелей в каталоге: {route.hotelCount}</p>
              {route.lowestPrice != null && (
                <p className="text-xs text-slate-600">Демо-цена от {formatMoney(route.lowestPrice)} ₸ / гость</p>
              )}
              <button
                type="button"
                onClick={() => onSelectCountry(route.country)}
                className="mt-2 rounded bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white"
              >
                Смотреть направление
              </button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
