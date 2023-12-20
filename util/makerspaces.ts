import * as SecureStore from 'expo-secure-store';
import { MakerspaceConfig, MakerspaceServers } from '../types/makerspaceServer';

export const addOrUpdateServer = async (server: MakerspaceConfig) => {
    const servers:MakerspaceServers = await getServers();
    servers[server.id] = server;
    await SecureStore.setItemAsync('servers', JSON.stringify(servers));
    const serversString = await SecureStore.getItemAsync('servers');
    alert('Added or updated server. SecureStore now contains: ' + serversString);

};

export const getServers = async () => {
    const serversString = await SecureStore.getItemAsync('servers');
    return serversString ? JSON.parse(serversString) as MakerspaceServers : {};
};
