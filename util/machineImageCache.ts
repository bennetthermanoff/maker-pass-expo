import AsyncStorage from '@react-native-async-storage/async-storage';

export const setImage = async (imageID:string, imageBASE64:string) => {
    const currentImages = await getImageIDs();
    if (!currentImages.includes(imageID)){
        currentImages.push(imageID);
    }
    AsyncStorage.setItem(imageID, imageBASE64);
    AsyncStorage.setItem('images', JSON.stringify(currentImages));
};

export const getImageIDs = async () => {
    const images = await AsyncStorage.getItem('images');
    return images ? JSON.parse(images) as string[] : [];
};

export const getImage = async (imageID:string) => {
    const image = await AsyncStorage.getItem(imageID);
    return image ? image : null;
};

export const clearImages = async () => {
    const images = await getImageIDs();
    images.forEach((imageID) => AsyncStorage.removeItem(imageID));
    AsyncStorage.removeItem('images');
};