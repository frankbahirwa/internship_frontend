"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Custom Marker Creators
// Custom Marker Creators - Ripple Pin Design
const createRipplePinIcon = (color) => {
    return L.divIcon({
        className: 'custom-ripple-pin',
        html: `
            <div class="ripple-pin-container" style="--pin-color: ${color}">
                <div class="ripple-base">
                    <div class="ripple-ring r1"></div>
                    <div class="ripple-ring r2"></div>
                </div>
                <div class="pin-svg">
                    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="${color}"/>
                        <circle cx="16" cy="16" r="8" fill="transparent" stroke="white" stroke-width="2.5" />
                    </svg>
                </div>
            </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 50],
    });
};

const hospitalIcon = createRipplePinIcon('#E63946');    // Ruby Pin
const donorIcon = createRipplePinIcon('#F5F3F4');       // Silver Pin
const userLocationIcon = createRipplePinIcon('#3B82F6'); // Blue Pin

function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function Map({ donors = [], hospitals = [] }) {
    const [mapCenter, setMapCenter] = useState([-1.9441, 30.0619]); // Default to Kigali
    const [userLoc, setUserLoc] = useState(null);
    const [zoom, setZoom] = useState(13);

    useEffect(() => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = [position.coords.latitude, position.coords.longitude];
                    setMapCenter(loc);
                    setUserLoc(loc);
                },
                () => {
                    console.log("Location access denied or unavailable.");
                }
            );
        }
    }, []);

    return (
        <div className="w-full h-full relative border-foreground/5 shadow-2xl">
            <style jsx global>{`
                .ripple-pin-container {
                    position: relative;
                    width: 40px;
                    height: 50px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    background: transparent !important;
                }
                .pin-svg {
                    z-index: 10;
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .ripple-base {
                    position: absolute;
                    bottom: -2px;
                    left: 50%;
                    transform: translateX(-50%) rotateX(75deg);
                    width: 40px;
                    height: 40px;
                    z-index: 1;
                    background: transparent !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ripple-ring {
                    position: absolute;
                    border: 1.5px solid var(--pin-color);
                    border-radius: 50%;
                    opacity: 0;
                    background: transparent !important;
                }
                .ripple-ring.r1 {
                    animation: ripple-pulse-refined 2.5s infinite ease-out;
                }
                .ripple-ring.r2 {
                    animation: ripple-pulse-refined 2.5s infinite ease-out 1.25s;
                }
                @keyframes ripple-pulse-refined {
                    0% { width: 4px; height: 4px; opacity: 1; }
                    100% { width: 40px; height: 40px; opacity: 0; }
                }
                .ripple-pin-container:hover .pin-svg {
                    transform: scale(1.15) translateY(-5px);
                }
                .premium-popup .leaflet-popup-content-wrapper {
                    background: #161A1D !important;
                    color: #F5F3F4 !important;
                    border: 1px solid rgba(230, 57, 70, 0.2);
                    border-radius: 16px;
                    padding: 4px;
                }
                .premium-popup .leaflet-popup-tip {
                    background: #161A1D !important;
                }
            `}</style>

            <MapContainer
                center={mapCenter}
                zoom={zoom}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
                zoomControl={false}
            >
                <ChangeView center={mapCenter} zoom={zoom} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* User Location Marker */}
                {userLoc && (
                    <Marker position={userLoc} icon={userLocationIcon}>
                        <Popup className="premium-popup">
                            <div className="p-2">
                                <h3 className="font-bold text-blue-400">Current Location</h3>
                                <p className="text-[10px] text-gray-400">Your Proximity Reference</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Hospital Markers */}
                {hospitals.map((hospital) => (
                    hospital.user?.latitude && hospital.user?.longitude && (
                        <Marker
                            key={`hospital-${hospital.id}`}
                            position={[hospital.user.latitude, hospital.user.longitude]}
                            icon={hospitalIcon}
                        >
                            <Popup className="premium-popup">
                                <div className="p-2">
                                    <h3 className="font-bold text-ruby">{hospital.hospitalName}</h3>
                                    <p className="text-xs text-gray-300">Hospital Facility</p>
                                    <div className="mt-2 text-[10px] font-bold text-ruby/60 uppercase tracking-widest">Active Services</div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}

                {/* Donor Markers */}
                {donors.map((donor) => (
                    donor.donor?.user?.latitude && donor.donor?.user?.longitude && (
                        <Marker
                            key={`donor-${donor.donor.id}`}
                            position={[donor.donor.user.latitude, donor.donor.user.longitude]}
                            icon={donorIcon}
                        >
                            <Popup className="premium-popup">
                                <div className="p-2">
                                    <h3 className="font-bold text-foreground">Hero Donor</h3>
                                    <p className="text-xs text-gray-400">Blood Type: {donor.donor.bloodType}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>

            {/* Map Overlay Controls */}
            <div className="absolute top-4 right-4 z-1000 flex flex-col gap-2">
                <button
                    onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
                    className="w-10 h-10 bg-obsidian-light/80 backdrop-blur-md border border-foreground/10 rounded-xl flex items-center justify-center text-white hover:bg-ruby transition-all active:scale-95 shadow-lg"
                >
                    +
                </button>
                <button
                    onClick={() => setZoom(prev => Math.max(prev - 1, 3))}
                    className="w-10 h-10 bg-obsidian-light/80 backdrop-blur-md border border-foreground/10 rounded-xl flex items-center justify-center text-white hover:bg-ruby transition-all active:scale-95 shadow-lg"
                >
                    -
                </button>
            </div>

            {/* Map Status Indicators */}
            <div className="absolute bottom-6 left-6 z-1000 flex gap-4">
                <div className="glass px-3 py-1.5 rounded-full border-foreground/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-ruby animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-tight">Hospitals</span>
                </div>
                <div className="glass px-3 py-1.5 rounded-full border-foreground/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-tight">Donors</span>
                </div>
                <div className="glass px-3 py-1.5 rounded-full border-foreground/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-tight">You</span>
                </div>
            </div>
        </div>
    );
}
