import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location';

export const getRawLocation = async () => {
    // Request permissions first
    const { status } = await requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        console.warn('Location permission denied');
        alert('Location permission required');
        return null;
    }

    // Get current position with standardized settings
    const locationRaw = await getCurrentPositionAsync({
        accuracy: 4,
        timeInterval: 5000,
        mayShowUserSettingsDialog: true,
    }).catch((error) => {
        console.warn('Location error:', error);
        alert('Could not get location. Please check that location services are enabled.');
        return null;
    });

    if (!locationRaw) {
        return null;
    }

    return locationRaw;
};
