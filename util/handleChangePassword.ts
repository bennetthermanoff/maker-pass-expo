import axios from 'axios';
import { Alert } from 'react-native';
import { getAuthHeaders } from './authRoutes';
import { getCurrentServer } from './makerspaces';

export const handleChangePassword = async () => {
    const makerspace = await getCurrentServer();
    if (!makerspace){
        return;
    }
    Alert.prompt('Change Password', 'Enter your new password', [
        {
            text: 'Cancel',
            style: 'cancel',
        },
        {
            text: 'Change',
            onPress: (newPassword) => {
                axios.post(
                    `${makerspace.serverAddress}:${makerspace.serverPort}/api/user/changePassword`,
                    { newPassword }, getAuthHeaders(makerspace),
                ).then(() => {
                    Alert.alert('Password Changed', 'Your password has been changed successfully');
                }).catch((err) => {
                    Alert.alert('Error', JSON.stringify(err.response));
                });
            },
            'style':'destructive',

        }], 'secure-text', undefined, 'new-password');
};