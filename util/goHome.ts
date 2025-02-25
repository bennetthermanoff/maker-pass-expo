import { store } from '../state/store';
import { clearStackGoTo } from './clearStackGoTo';

export const goHome = async () => {
    //if no makerspace, root
    //if not logged in, login/register
    //if logged in, dashboard
    const makerspaceId = store.getState().makerspaces.currentServerId;
    if (makerspaceId === null){
        clearStackGoTo('/welcome');
        return;
    }
    const makerspace = store.getState().makerspaces.serverMap[makerspaceId];
    if (makerspace?.user === undefined){
        clearStackGoTo('/start/choose');
    }
    else {
        clearStackGoTo('/home/');
    }
};