import axios from 'axios';
import { setStringAsync } from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { GLOBAL } from '../global';
import { addOrUpdateServer, addServerCredentials, setCurrentServer } from '../state/slices/makerspacesSlice';
import { store } from '../state/store';
import { Machine } from '../types/machine';
import { getAuthHeaders } from './authRoutes';
import { goHome } from './goHome';
import { handleChangePassword } from './handleChangePassword';
import { getLocation } from './locationCache';

export const handleURL =  (url:string|null) => {
    if (url === null) {
        return;
    }
    const { path, queryParams, hostname } = Linking.parse(url);
    //makerspace example config path:
    // /makerspace/config?url=192.168.0.1&port=8080&registrationType=admin&registrationKey=1234
    // alert('Path: ' + path + '\nHostname: ' + hostname + '\nQuery Params: ' + JSON.stringify(queryParams));
    if (path === 'makerspace/config' ){
        try {
            const { url, port, registrationType, registrationKey } = queryParams ?? {} as { url?: string, port?: string, registrationType?: string, registrationKey?: string };
            handleConnect(url as string, port as string, registrationType as string, registrationKey as string);
            return 'Connecting...';
        }
        catch (err){
            alert('Error: ' + err);
        }

    }
    if (path ===  'makerspace/machine/enable'){
        try {
            const { serverId, machineId, enableKey, locationRequired } = queryParams ?? {} as {serverId: string, machineId:string, enableKey?:string, locationRequired?:string};
            handleEnableMachine({ serverId:serverId as string, machineId:machineId as string, enableKey: enableKey as string|undefined, locationRequired: locationRequired as string });
            return 'Enabling...';
        }
        catch (err){
            alert('Error: ' + err);
        }
    }
    if (path === 'makerspace/login'){
        try {
            const { token, userId, userType, serverId } = queryParams ?? {} as { token?: string, userId?: string, userType?: string, serverId?: string };
            if (!token || !userId || !userType || !serverId){
                throw new Error('Invalid Login Parameters');
            }
            store.dispatch(addServerCredentials({ serverId:serverId as string, userId:userId as string, userType:userType as string, token:token as string }));
            new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
                const makerspaceId = serverId as string;
                const makerspace = store.getState().makerspaces.serverMap[makerspaceId];
                goHome();
                Alert.alert(
                    'Logged In', 'Please reset your password',
                    [{ text: 'Reset Password', onPress: () =>
                        handleChangePassword(makerspace),
                    }],
                );
            });

            return 'Logging In...';
        }
        catch (err){
            alert('Error: ' + err);
        }
    }

};

export const handleTagOutURL = (url:string) => {
    const { path, queryParams, hostname } = Linking.parse(url);

    if (path === 'makerspace/machine/enable'){
        const { machineId } = queryParams ?? {} as {machineId:string};
        router.push(`/tagoutMachine/${machineId}`);
    }

};

export const handleConnect = async (url?:string, port?:string, registrationType?:string, registrationKey?:string) => {
    if (!url || !port || !registrationType || !registrationKey){
        alert('Invalid config');
        return;
    }
    const ping = await axios.post( url + ':' + port + '/api/ping', { registrationType, registrationKey })
        .then((response) => response)
        .catch((err) => {
            alert(JSON.stringify(err.response.data));
            return;
        });
    if (!ping){
        return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    delete ping.data.server.additionalInfoFields;
    store.dispatch(addOrUpdateServer({ ...ping.data.server, registrationKey:registrationKey as string, registrationType: registrationType as string }));

    router.replace('/');
    const { status } = await Location.getForegroundPermissionsAsync();

    if (ping.data.server.hasGeoFences && status !== 'granted'){
        router.replace('/start/locationHeadsup');
    } else {
        router.replace('/start/choose');
    }
};
const handleEnableMachine = async ({ serverId, machineId, enableKey, locationRequired }:{ serverId: string, machineId:string, enableKey?:string, locationRequired:string}) => {
    const makerspaces = store.getState().makerspaces.serverMap;
    if (!makerspaces[serverId]){
        throw new Error('Not Signed Into This Makerspace!');
    }
    const makerspace = makerspaces[serverId];
    if (!makerspace){
        throw new Error( 'Makerspace Not Found!');
    }
    store.dispatch(setCurrentServer(serverId));

    let location:{lat:number, lng:number}|undefined = undefined;
    if (locationRequired === 'true'){
        const newLocation = await getLocation();
        if (!newLocation){
            throw new Error('Location Permission Required');
        } else {
            location = newLocation;
        }

    }
    const { data }:{data:{message:string, machine:Machine }} = await axios.post(
        `${makerspace.serverAddress}:${makerspace.serverPort}/api/machine/enable/single/${machineId}`,
        { enableKey, location },
        getAuthHeaders(makerspace),
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    GLOBAL.getMachines();
    goHomeOnBarAndCallFinished();
    GLOBAL.getMachines();

};

export const goHomeOnBarAndCallFinished = () => {
    if (GLOBAL.barRaceCondition === 0 ){
        GLOBAL.barRaceCondition = 1;
    } else {
        GLOBAL.barRaceCondition = 0;
        goHome();
    }
};

export const copyQR = async (qr:string) => {
    await setStringAsync(qr);
    alert('QR URL Copied to Clipboard!');
};
