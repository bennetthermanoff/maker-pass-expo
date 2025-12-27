import { getCurrentPositionAsync, getForegroundPermissionsAsync, requestForegroundPermissionsAsync } from 'expo-location';

export const getRawLocation = async () => {
    // Request permissions first
    let { status } = await getForegroundPermissionsAsync();

    if (status !== 'granted') {
        console.warn('Location permission denied');
        await requestForegroundPermissionsAsync();
        status = (await getForegroundPermissionsAsync()).status;
    }

    if (status !== 'granted') {
        console.warn('Location permission still denied after request');
        alert('Location permission is required to enable this machine.');
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
