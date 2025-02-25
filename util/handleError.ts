import axios from 'axios';
import { router } from 'expo-router';
import { Alert } from 'react-native';
const handleError = (err: any) => {
    const scrubbedError = removeAttrDeep(err, 'accesstoken');
    //if 400, print message
    if (err.response?.status === 400) {
        if (err.response?.data?.message === 'Invalid password'){
            Alert.alert('Wrong Password', 'The password you entered is incorrect.', [
                { text: 'Dismiss', onPress: () => {} },
                { text: 'Forgot Password', onPress: () => {
                    Alert.alert('Forgot Password', 'Please contact your administrator to reset your password.', [
                        { text: 'Dismiss', onPress: () => {} },
                        { text: 'Scan QR Code', onPress: () => {
                            router.push('/scanner');
                        } },
                    ]);
                } },
            ]);
        }
        else {
            Alert.alert('Oops, something went wrong', err.response?.data?.message, [
                { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(scrubbedError)) },
                { text: 'Dismiss', onPress: () => {} },
            ]);
        }
    }
    else if (err.response?.status === 401) {
        return Promise.reject(err);
    }
    else if (err.response?.status === 403) {
        Alert.alert('Oops, something went wrong', 'You do not have permission to perform this action.', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(scrubbedError)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else if (err.response?.status === 404) {
        Alert.alert('Oops, something went wrong', 'The requested resource was not found.', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(scrubbedError)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else if (err.response?.status === 500) {
        Alert.alert('Oops, something went wrong', 'The server encountered an error. Please try again later.', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(err.response?.data?.message) + JSON.stringify(scrubbedError)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else if (err.response?.status === 502 || err.response?.status === 503) {
        Alert.alert('Oops, something went wrong', 'The server is currently down. Please try again later.', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(scrubbedError)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else if (err.response?.status === 504) {
        Alert.alert('Oops, something went wrong', 'The server is taking too long to respond. Please try again later.', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(scrubbedError)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else if (err.request) {
        Alert.alert('Oops, something went wrong', 'The server is not responding. Please check your internet connection.', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(scrubbedError)) },
            { text: 'Dismiss', onPress: () => {} },
        ]);
    }
    else {
        Alert.alert('Oops, something went wrong', '', [
            { text: 'Show Details', onPress: () => Alert.alert('Error Details', JSON.stringify(scrubbedError)) },
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