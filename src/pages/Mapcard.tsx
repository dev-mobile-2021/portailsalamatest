import React, { useEffect, useRef, useState } from "react";
import { APIProvider, Map, useMap, useMapsLibrary, Marker } from "@vis.gl/react-google-maps";
import { useDelivery } from "../hooks/useUserDelivery";

const SearchAndMap = () => {
    const { currentPosition, setCurrentPosition, setDeliveryAddress, deliveryMode, otherPosition, setotherPosition } = useDelivery();
    const map = useMap();
    const placesLibrary = useMapsLibrary("places");
    const inputRef = useRef<HTMLInputElement>(null);
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

    console.log("Google Maps estcharg de la base de donnée", isGoogleLoaded);

    useEffect(() => {
        console.log(isGoogleLoaded);
        if (!map) return;

        // Initialiser directionsService et directionsRenderer une seule fois
        directionsServiceRef.current = new google.maps.DirectionsService();
        directionsRendererRef.current = new google.maps.DirectionsRenderer({ map });

        // Nettoyer à la destruction du composant
        return () => {
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(null); // Détacher le renderer de la carte
            }
        };
    }, [map]);

    // Vérifier que Google Maps est chargé
    useEffect(() => {
        console.log("Google Maps estcharg");
        if (window.google) {
            setIsGoogleLoaded(true);
        } else {
            console.error("Google Maps API n'est pas chargée.");
        }
    }, [window.google]);

    const handleGeocode = async (position: google.maps.LatLngLiteral | null) => {
        if (!position || !map || !inputRef.current) return;

        const geocoder = new google.maps.Geocoder();

        const latLng = new google.maps.LatLng(position.lat, position.lng);

        // Utiliser Geocoder pour obtenir l'adresse
        geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === "OK" && results && results.length > 0) {
                const place = results[0];

                // Utiliser Places pour obtenir le nom du lieu
                if (!placesLibrary) return;
                const placesService = new placesLibrary.PlacesService(map);
                placesService.nearbySearch(
                    {
                        location: latLng,
                        radius: 50,
                        type: "establishment",
                    },
                    (placesResults: google.maps.places.PlaceResult[] | null, placesStatus: google.maps.places.PlacesServiceStatus) => {
                        if (placesStatus === google.maps.places.PlacesServiceStatus.OK && placesResults && placesResults.length > 0) {
                            const nearestPlace = placesResults[0]; // Prendre le lieu le plus proche

                            // Concaténer le nom du lieu et l'adresse
                            const placeName = nearestPlace.name || "";
                            const formattedAddress = place.formatted_address || "";
                            const fullAddress = placeName ? `${placeName}, ${formattedAddress}` : formattedAddress;

                            // Mettre à jour la carte et l'input
                            map.setCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
                            if (inputRef.current) inputRef.current.value = fullAddress;
                            setDeliveryAddress(fullAddress); // Mettre à jour l'adresse dans le contexte
                            map.setZoom(16);
                        } else {
                            // Si aucun lieu n'est trouvé, utiliser uniquement l'adresse
                            const formattedAddress = place.formatted_address || "";
                            map.setCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
                            if (inputRef.current) inputRef.current.value = formattedAddress;
                            setDeliveryAddress(formattedAddress);
                            map.setZoom(16);
                        }
                    }
                );
            }
        });
    };

    const handleCalculateAndDisplayRoute = () => {
        if (!currentPosition || !otherPosition || !map) return;

        const directionsService = directionsServiceRef.current;
        const directionsRenderer = directionsRendererRef.current;

        if (!directionsService || !directionsRenderer) return;

        // Supprimer l'itinéraire précédent
        directionsRenderer.setDirections(null);

        // Calculer et afficher le nouvel itinéraire
        directionsService.route(
            {
                origin: currentPosition,
                destination: otherPosition,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (response, status) => {
                if (status === google.maps.DirectionsStatus.OK && response) {
                    directionsRenderer.setDirections(response);
                } else {
                    console.error("Erreur lors de l'itinéraire :", status);
                    directionsRenderer.setDirections(null);
                }
            }
        );
    };



    // currentPosition
    // useEffect(() => {
    //     handleGeocode(currentPosition);
    // }, [currentPosition]);



    // otherPosition
    useEffect(() => {
        if (!otherPosition || !map) return;

        handleGeocode(otherPosition);
        handleCalculateAndDisplayRoute();
    }, [otherPosition, map]);


    //recherche d'adresse
    useEffect(() => {
        if (placesLibrary && inputRef.current) {
            const autocomplete = new placesLibrary.Autocomplete(inputRef.current, { fields: ["geometry", "name"] });
            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (place.geometry?.location) {
                    const loc = place.geometry.location;
                    setCurrentPosition({ lat: loc.lat(), lng: loc.lng() });
                    setDeliveryAddress(place.name || null);
                    map?.setCenter({ lat: loc.lat(), lng: loc.lng() });
                }
            });
        }
    }, [placesLibrary, map, setDeliveryAddress]);





    // Effacer les marqueurs si le mode de livraison est "dépôt"
    useEffect(() => {
        if (deliveryMode?.code === "pdr") {
            setotherPosition(null); // Effacer le marqueur de recherche
        }
    }, [deliveryMode]);




    return (
        <div style={{ width: "100%", height: "400px", position: "relative" }}>
            <div style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 1000 }}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Rechercher un lieu..."
                    style={{ padding: "8px", width: "300px", border: "none", borderRadius: "5px", outline: "none" }}
                />
            </div>
            <Map style={{ width: "100%", height: "100%" }} defaultCenter={currentPosition || { lat: 14.745, lng: -14.523 }} defaultZoom={12}>
                {/* Afficher le marqueur de position actuelle uniquement si le mode n'est pas "dépôt" */}
                {currentPosition && <Marker position={currentPosition} />}
                {/* Afficher le marqueur de recherche uniquement si le mode n'est pas "dépôt" */}
                {otherPosition && <Marker position={otherPosition} />}
            </Map>
        </div>
    );
};

const Mapcard = () => {
    return (
        <>
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <SearchAndMap />
            </APIProvider>
        </>
    );
};

export default React.memo(Mapcard);