"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from "@react-google-maps/api";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const containerStyle = {
    width: "100%",
    height: "350px",
    borderRadius: "12px",
};

// Default center: India
const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629,
};

interface LocationPickerProps {
    onLocationSelect: (location: {
        address: string;
        city: string;
        state: string;
        pincode: string;
        lat: number;
        lng: number;
    }) => void;
    initialLat?: number;
    initialLng?: number;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
    onLocationSelect,
    initialLat,
    initialLng
}) => {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: ["places"],
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : defaultCenter
    );
    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
        if (initialLat && initialLng) {
            map.panTo({ lat: initialLat, lng: initialLng });
            map.setZoom(15);
        }
    }, [initialLat, initialLng]);

    const getAddressFromCoords = async (lat: number, lng: number) => {
        const geocoder = new google.maps.Geocoder();
        try {
            const response = await geocoder.geocode({ location: { lat, lng } });
            if (response.results[0]) {
                const result = response.results[0];
                let city = "";
                let state = "";
                let pincode = "";

                result.address_components.forEach((component) => {
                    if (component.types.includes("locality")) city = component.long_name;
                    if (component.types.includes("administrative_area_level_1")) state = component.long_name;
                    if (component.types.includes("postal_code")) pincode = component.long_name;
                });

                onLocationSelect({
                    address: result.formatted_address,
                    city,
                    state,
                    pincode,
                    lat,
                    lng,
                });
            }
        } catch (error) {
            console.error("Geocoding failed:", error);
        }
    };

    const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPosition({ lat, lng });
            getAddressFromCoords(lat, lng);
        }
    };

    const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
        searchBoxRef.current = ref;
    };

    const onPlacesChanged = () => {
        const places = searchBoxRef.current?.getPlaces();
        if (places && places.length > 0) {
            const place = places[0];
            if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const position = { lat, lng };

                setMarkerPosition(position);
                map?.panTo(position);
                map?.setZoom(16);

                let city = "";
                let state = "";
                let pincode = "";

                place.address_components?.forEach((component) => {
                    if (component.types.includes("locality")) city = component.long_name;
                    if (component.types.includes("administrative_area_level_1")) state = component.long_name;
                    if (component.types.includes("postal_code")) pincode = component.long_name;
                });

                onLocationSelect({
                    address: place.formatted_address || "",
                    city,
                    state,
                    pincode,
                    lat,
                    lng,
                });
            }
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const pos = { lat, lng };
                    setMarkerPosition(pos);
                    map?.panTo(pos);
                    map?.setZoom(15);
                    getAddressFromCoords(lat, lng);
                },
                () => {
                    alert("Error: The Geolocation service failed.");
                }
            );
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-[350px] bg-gray-50 rounded-xl border-2 border-dashed">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="relative">
                <StandaloneSearchBox
                    onLoad={onSearchBoxLoad}
                    onPlacesChanged={onPlacesChanged}
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search for a location..."
                            className="pl-10 pr-32"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 text-xs"
                            onClick={getCurrentLocation}
                        >
                            <MapPin className="h-3 w-3 mr-1" />
                            My Location
                        </Button>
                    </div>
                </StandaloneSearchBox>
            </div>

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={markerPosition}
                zoom={initialLat ? 15 : 5}
                onLoad={onMapLoad}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                }}
                onClick={(e) => {
                    if (e.latLng) {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        setMarkerPosition({ lat, lng });
                        getAddressFromCoords(lat, lng);
                    }
                }}
            >
                <Marker
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={onMarkerDragEnd}
                    animation={google.maps.Animation.DROP}
                />
            </GoogleMap>

            <p className="text-[10px] text-muted-foreground text-center">
                Tip: You can search, click on the map, or drag the marker to pick a location.
            </p>
        </div>
    );
};

export default LocationPicker;
