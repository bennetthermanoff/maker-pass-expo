import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import axios from 'axios';
import { MakerspaceConfig, MakerspaceServers, PingResponse } from '../types/makerspaceServer';
import { addOrUpdateServer, getCurrentServer, getServer, getServers, setCurrentServer } from './makerspaces';
import { Machine } from '../types/machine';
import { getAuthHeaders } from './authRoutes';
import { goHome, handleUserLoginError } from './goHome';
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
        throw 'Not Signed Into This Makerspace!';
        return;
    }
    const makerspace = await getServer(serverId);
    if (!makerspace){
        throw 'Makerspace Not Found!';
        return;
    }
    await setCurrentServer(serverId);
    router.replace('/scanner/enabling/:machineId');
    if (locationRequired === 'true'){
        // TODO: Location
        //const coords =
        throw 'Location not implemented';
        return;
    }
    try {
        const { data }:{data:{message:string, machine:Machine }} = await axios.post(
            `${makerspace.serverAddress}:${makerspace.serverPort}/api/machine/enable/single/${machineId}`,
            { enableKey, location:locationRequired ? { lat:0,lng:0 } : undefined },
            getAuthHeaders(makerspace),
        );
        if (!router.canGoBack()){ //if user is on home screen already, we should trigger a refresh to show the new status
            goHomeOnBarAndCallFinished();
        }
    } catch (err:any){
        if (err.response.status === 401){
            handleUserLoginError();
        } else {
            alert(err);
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
