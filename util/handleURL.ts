import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import axios from 'axios';
import { MakerspaceConfig, PingResponse } from '../types/makerspaceServer';
import { addOrUpdateServer, setAdditionalInfo } from './makerspaces';

export const handleURL = async (url:string|null) => {
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
