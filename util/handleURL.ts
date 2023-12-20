import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import axios from 'axios';
import { MakerspaceConfig, PingResponse } from '../types/makerspaceServer';
import { addOrUpdateServer } from './makerspaces';

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
            alert('Attempting to ping server...');
            const { url, port, registrationType, registrationKey } = queryParams ?? {} as { url?: string, port?: string, registrationType?: string, registrationKey?: string };
            const pingResponse:PingResponse = await axios.get('http://' + url + ':' + port + '/api/ping');
            alert('Ping response: ' + JSON.stringify(pingResponse));
            await addOrUpdateServer(pingResponse.server);

            while (router.canGoBack()) { // Pop from stack until one element is left, resets the stack
                router.back();
            }
            router.replace('/start/choose');
        }
        catch (err){
            alert('Error: ' + err);
        }

    }
};

