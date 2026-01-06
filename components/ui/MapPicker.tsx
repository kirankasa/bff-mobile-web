"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

type MapPickerProps = {
    position: { lat: number; lng: number } | null;
    onLocationSelect: (lat: number, lng: number) => void;
};

// Component to handle map clicks
function LocationMarker({ position, onLocationSelect }: MapPickerProps) {
    const map = useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
            // We don't flyTo here anymore to avoid fighting with MapUpdater or user scroll
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function MapPicker({ position, onLocationSelect }: MapPickerProps) {
    // Default center (e.g., Hyderabad, India)
    const defaultCenter = { lat: 17.3850, lng: 78.4867 };

    // Component to synchronize map center with 'position' prop
    // This ensures if position is set (e.g. by auto-detect), the map moves there.
    function MapUpdater({ position }: { position: { lat: number; lng: number } | null }) {
        const map = useMapEvents({});
        useEffect(() => {
            if (position) {
                map.flyTo(position, map.getZoom(), {
                    animate: true,
                    duration: 1.5 // Smoother animation
                });
            }
        }, [position, map]);
        return null;
    }

    // Component to handle auto-location on mount
    function LocationFinder() {
        useEffect(() => {
            // Only search if no position is already set (don't override if editing existing address)
            if (!position && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        console.log("Auto-detected location:", pos.coords.latitude, pos.coords.longitude);
                        onLocationSelect(pos.coords.latitude, pos.coords.longitude);
                    },
                    (err) => {
                        console.warn("Geolocation failed or denied:", err);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            }
        }, []); // Run once on mount

        return null;
    }

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 z-0 relative">
            <MapContainer
                center={position || defaultCenter}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} onLocationSelect={onLocationSelect} />
                <MapUpdater position={position} />
                <LocationFinder />
            </MapContainer>

            {/* Locate Me Button */}
            <button
                type="button"
                className="absolute bottom-4 right-4 z-[400] bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                onClick={(e) => {
                    e.stopPropagation();
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                            onLocationSelect(pos.coords.latitude, pos.coords.longitude);
                        }, (err) => {
                            alert("Could not get location. Please allow location access.");
                            console.error(err);
                        });
                    } else {
                        alert("Geolocation is not supported by your browser.");
                    }
                }}
                title="Locate Me"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
            </button>
        </div>
    );
}
