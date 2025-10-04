import axios from 'axios';
import * as Haptics from 'expo-haptics';
import { Machine } from '../types/machine';
import { MakerspaceConfig } from '../types/makerspaceServer';
import { getAuthHeaders } from './authRoutes';

export const getMachinesFromServer = async (makerspace:MakerspaceConfig, withImages?:boolean) => {
    const response = await axios.get(
        `${makerspace.serverAddress}:${makerspace.serverPort}/api/machine/all${withImages ? '/photos' : ''}`,
        getAuthHeaders(makerspace),
    ).catch((err) => {
        throw err;
    });

    return response.data.machines as Array<Machine>;

};

export const disableMachineRoute = async (machineId:string, makerspace:MakerspaceConfig) => {
    try {
        const response = await axios.get(
            `${makerspace.serverAddress}:${makerspace.serverPort}/api/machine/disable/single/${machineId}`,
            getAuthHeaders(makerspace),
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return response.data as {message:string, machine:Machine};
    }
    catch (e){
        return { message: '', machine: {} as Machine };
    }
};

export const getMachineBlameList = async (machineId: string, makerspace: MakerspaceConfig, limit?: number) => {
    try {
        const response = await axios.get(
            `${makerspace.serverAddress}:${makerspace.serverPort}/api/machine/blame/${machineId}${limit ? `?limit=${limit}` : ''}`,
            getAuthHeaders(makerspace),
        );
        return response.data;
    }
    catch (e) {
        throw e;
    }
};