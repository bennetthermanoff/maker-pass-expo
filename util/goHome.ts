import { clearStackGoTo } from './clearStackGoTo';
import { getCurrentServer } from './makerspaces';

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
        clearStackGoTo('/tabs/');
    }
};