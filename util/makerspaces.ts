import * as SecureStore from 'expo-secure-store';
import { MakerspaceConfig, MakerspaceServers } from '../types/makerspaceServer';

export const addOrUpdateServer = async (server: MakerspaceConfig) => {
    const servers:MakerspaceServers = await getServers();
    servers[server.id] = server;
    await SecureStore.setItemAsync('servers', JSON.stringify(servers));
    await SecureStore.setItemAsync('currentServer', server.id);

};

export const getServers = async () => {
    const serversString = await SecureStore.getItemAsync('servers');
    return serversString ? JSON.parse(serversString) as MakerspaceServers : {};
};

export const getCurrentServer = async () => {
    const currentServerId = await SecureStore.getItemAsync('currentServer');
    const servers = await getServers();
    return currentServerId ? servers[currentServerId] : null;
};

export const removeServer = async (serverId: string) => {
    const servers = await getServers();
    delete servers[serverId];
    await SecureStore.setItemAsync('servers', JSON.stringify(servers));
};

export const setCurrentServer = async (serverId: string) => {
    await SecureStore.setItemAsync('currentServer', serverId);
};

export const clearServers = async () => {
    await SecureStore.deleteItemAsync('servers');
    await SecureStore.deleteItemAsync('currentServer');
};

export const addServerCredentials = async ({ serverId, userId, userType, token }:{serverId: string, userId: string, userType: string, token: string}) => {
    const servers = await getServers();
    servers[serverId].user = {
        userId,
        userType,
        token,
    };
    await SecureStore.setItemAsync('servers', JSON.stringify(servers));
};

export const removeServerCredentials = async (serverId: string) => {
    const servers = await getServers();
    delete servers[serverId].user;
    await SecureStore.setItemAsync('servers', JSON.stringify(servers));
};

export const getCurrentServerCredentials = async () => {
    const currentServer = await getCurrentServer();
    return currentServer?.user;
};

export const getCurrentTheme = async () => {
    const currentServer = await getCurrentServer();
    return currentServer?.theme;
};