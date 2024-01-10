import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import axios from 'axios';
import { MakerspaceConfig, MakerspaceServers, PingResponse } from '../types/makerspaceServer';
import { addOrUpdateServer, getCurrentServer, getServer, getServers, setCurrentServer } from './makerspaces';
import { Machine } from '../types/machine';
import { getAuthHeaders } from './authRoutes';
import { goHome, handleUserLoginError } from './goHome';
import * as Location from 'expo-location';
import { GLOBAL } from '../global';

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
};

export const handleConnect = async (url?:string, port?:string, registrationType?:string, registrationKey?:string) => {
    if (!url || !port || !registrationType || !registrationKey){
        alert('Invalid config');
        return;
    }
    const { data:pingResponse }:{data:PingResponse} = await axios.post( url + ':' + port + '/api/ping', { registrationType, registrationKey })
        .then((response) => response)
        .catch((err) => ({ data: { message: err.message, server: null } as PingResponse }));
    if (pingResponse.server === null){
        alert(pingResponse.message);
        return;
    }

    delete pingResponse.server.additionalInfoFields;
    await addOrUpdateServer({ ...pingResponse.server, registrationKey:registrationKey as string, registrationType: registrationType as string });

    while (router.canGoBack()) { // Pop from stack until one element is left, resets the stack
        router.back();
    }
    router.replace('/start/choose');
};
const handleEnableMachine = async ({ serverId, machineId, enableKey, locationRequired }:{ serverId: string, machineId:string, enableKey?:string, locationRequired:string}) => {
    const makerspaces = await getServers();
    if (!makerspaces.find((makerspaceId) => makerspaceId === serverId)){
        throw new Error('Not Signed Into This Makerspace!');

    }
    const makerspace = await getServer(serverId);
    if (!makerspace){
        throw new Error( 'Makerspace Not Found!');
    }
    await setCurrentServer(serverId);

    let location:{lat:number, lng:number}|undefined = undefined;
    if (locationRequired === 'true'){
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access location was denied');
            return;
        }

        const locationRaw = await Location.getCurrentPositionAsync({});
        location = { lat:locationRaw.coords.latitude, lng:locationRaw.coords.longitude };
    }
    try {
        const { data }:{data:{message:string, machine:Machine }} = await axios.post(
            `${makerspace.serverAddress}:${makerspace.serverPort}/api/machine/enable/single/${machineId}`,
            { enableKey, location },
            getAuthHeaders(makerspace),
        );
        GLOBAL.getMachines();
        goHomeOnBarAndCallFinished();
    } catch (err:any){
        if (err.response.status === 401){
            handleUserLoginError();

        } else {
            alert(JSON.stringify(err));
        }
    }

};

export const goHomeOnBarAndCallFinished = () => {
    if (GLOBAL.barRaceCondition === 0 ){
        GLOBAL.barRaceCondition = 1;
    } else {
        GLOBAL.barRaceCondition = 0;
        goHome();
    }
};
