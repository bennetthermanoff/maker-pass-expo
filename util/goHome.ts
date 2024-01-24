import { router } from 'expo-router';
import { clearStackGoTo } from './clearStackGoTo';
import { getCurrentServer, removeServerCredentials } from './makerspaces';
import { GLOBAL } from '../global';

export const goHome = async() => {
    //if no makerspace, root
    //if not logged in, login/register
    //if logged in, dashboard
    const currentMakerspace = await getCurrentServer();
    if (currentMakerspace === null){
        clearStackGoTo('/');
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
        removeServerCredentials(currentMakerspace?.id);
        clearStackGoTo('/start/choose');
        router.push('/start/login');
    }

};