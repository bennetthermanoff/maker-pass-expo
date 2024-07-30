import axios from 'axios';
import { Alert } from 'react-native';
const handleError = (err: any) => {
    const error = removeAttrDeep(err, 'accesstoken');
    //if 400, print message
    if (err.response?.status === 400) {
        Alert.alert('Oops, something went wrong', error.response.data.message, [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(error)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else if (err.response?.status === 401) {
        Alert.alert('Oops, something went wrong', 'Please log in again.', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(error)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else if (err.response?.status === 403) {
        Alert.alert('Oops, something went wrong', 'You do not have permission to perform this action.', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(error)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else if (err.response?.status === 404) {
        Alert.alert('Oops, something went wrong', 'The requested resource was not found.', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(error)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else if (err.response?.status === 500) {
        Alert.alert('Oops, something went wrong', 'The server encountered an error. Please try again later.', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(error)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else if (err.response?.status === 502 || err.response?.status === 503) {
        Alert.alert('Oops, something went wrong', 'The server is currently down. Please try again later.', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(error)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else if (err.response?.status === 504) {
        Alert.alert('Oops, something went wrong', 'The server is taking too long to respond. Please try again later.', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(error)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else if (error.request) {
        Alert.alert('Oops, something went wrong', 'The server is not responding. Please check your internet connection.', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(error)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else {
        Alert.alert('Oops, something went wrong', '', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(error)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }

};
export const configAxiosInterceptors = () => {
    axios.interceptors.response.use((response) => response, (error) => {
        handleError(error);
        return Promise.reject(error);
    });
};

const removeAttrDeep = (obj: any, key: string) => {
    const stringified = JSON.stringify(obj, (k, v) => (k === key ? '*****' : v));
    return JSON.parse(stringified);
};