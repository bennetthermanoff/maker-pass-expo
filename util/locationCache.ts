import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRawLocation } from './getRawLocation';

const LOCATION_STALE_TIME = 1000 * 60 * .5; // 30 seconds
const LOCATION_EXPIRE_TIME = 1000 * 60 * 2; // 2 minutes

type Location = { lat: number, lng: number , timestamp: number};

const getCachedLocation = async () => {
    const location = await AsyncStorage.getItem('location');
    return location ? JSON.parse(location) as Location : null;
};

const setLocation = async (location:{lat:number,lng:number}) => {
    const newLocation = { ...location, timestamp: Date.now() };
    const cachedLocation = await getCachedLocation();
    if (cachedLocation && newLocation.timestamp < cachedLocation.timestamp){
        return;
    }
    AsyncStorage.setItem('location', JSON.stringify(newLocation));
};

export const getLocation: () => Promise<{lat:number,lng:number} | null> = async () => {
    const cachedLocation = await getCachedLocation();
    if (cachedLocation && Date.now() - cachedLocation.timestamp < LOCATION_EXPIRE_TIME){
        return { lat: cachedLocation.lat, lng: cachedLocation.lng };
    }

    const locationRaw = await getRawLocation();

    if (!locationRaw) {
        return null;
    }

    const location = { lat: locationRaw.coords.latitude, lng: locationRaw.coords.longitude };
    setLocation(location);
    return location;
};

export const cacheCurrentLocation = async () => {
    const cachedLocation = await getCachedLocation();
    if (cachedLocation && Date.now() - cachedLocation.timestamp < LOCATION_STALE_TIME){
        return;
    }

    const locationRaw = await getRawLocation();

    if (!locationRaw) {
        return;
    }

    const location = { lat: locationRaw.coords.latitude, lng: locationRaw.coords.longitude };
    setLocation(location);
};

export const clearLocationCache = async () => {
    AsyncStorage.removeItem('location');
};
