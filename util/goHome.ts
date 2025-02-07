import { router } from 'expo-router';
import { GLOBAL } from '../global';
import { clearStackGoTo } from './clearStackGoTo';
import { getCurrentServer, removeServerCredentials } from './makerspaces';

export const goHome = async() => {
    //if no makerspace, root
    //if not logged in, login/register
    //if logged in, dashboard
    const currentMakerspace = await getCurrentServer();
    if (currentMakerspace === null){
        clearStackGoTo('/welcome');
    }
    else if (currentMakerspace.user === undefined){
        clearStackGoTo('/start/choose');
    }
    else {
        clearStackGoTo('/home/');
    }
};

export const handleUserLoginError = async () => {
    const currentMakerspace = await getCurrentServer();
    if (currentMakerspace?.user){
        alert('Session expired. Please log in again.');
        GLOBAL.getMachines = async () => {};
        removeServerCredentials(currentMakerspace?.id);
        clearStackGoTo('/start/choose');
        router.push('/start/login');
    }

};