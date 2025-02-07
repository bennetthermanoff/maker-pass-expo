import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { MakerspaceConfig, MakerspaceServers as MakerspaceServerIds, MakerspaceTheme } from '../types/makerspaceServer';

export const addOrUpdateServer = async (server: MakerspaceConfig) => {
    let currentServer = await getServer(server.id);
    const servers = await getServers();

    if (currentServer) {
        currentServer = { ...currentServer, ...server };
    }
    else {
        currentServer = server;
    }
    await SecureStore.setItemAsync(server.id, JSON.stringify(currentServer));

    if (!servers?.includes(server.id)) {
        servers.push(server.id);
    }
    await SecureStore.setItemAsync('servers', JSON.stringify(servers));
    await setTheme(server.theme, server.id);
    setCurrentServer(server.id);
};

export const getServers = async () => {
    const serversString = await SecureStore.getItemAsync('servers');
    return serversString ? JSON.parse(serversString) as MakerspaceServerIds : [];
};

export const getServer = async (serverId: string) => {
    const server = await SecureStore.getItemAsync(serverId);
    return server ? JSON.parse(server) as MakerspaceConfig : null;
};

export const getCurrentServer = async () => {
    const currentServerId = await getCurrentServerId();
    const server = currentServerId ? await SecureStore.getItemAsync(currentServerId) : null;
    return server ? JSON.parse(server) as MakerspaceConfig : null;
};
export const getCurrentServerId = async () => await AsyncStorage.getItem('currentServer');

export const removeServer = async (serverId: string) => {
    await SecureStore.deleteItemAsync(serverId);
    let servers = await getServers();
    if (!servers) {
        servers = [];
    }
    servers = servers?.filter((server) => server !== serverId);

    await SecureStore.setItemAsync('servers', JSON.stringify(servers));
    await AsyncStorage.removeItem(`${serverId}-theme`);
};

export const setServers = async (servers: MakerspaceServerIds) => {
    await SecureStore.setItemAsync('servers', JSON.stringify(servers));
};

export const setCurrentServer = async (serverId: string) => {
    await AsyncStorage.setItem('currentServer', serverId);
};

export const clearServers = async () => {
    const servers = await getServers();
    servers.forEach((server) => {SecureStore.deleteItemAsync(server); AsyncStorage.removeItem(`${server}-theme`);});
    await SecureStore.deleteItemAsync('servers');
    await AsyncStorage.removeItem('currentServer');

};

export const addServerCredentials = async ({ serverId, userId, userType, token }:{serverId: string, userId: string, userType: string, token: string}) => {
    const server = await getServer(serverId);
    if (server) {
        server.user = { userId, userType, token };
        await SecureStore.setItemAsync(serverId, JSON.stringify(server));
    }
    else {
        throw new Error('Server not found');
    }
};

export const removeServerCredentials = async (serverId: string) => {
    const server = await getServer(serverId);
    if (server) {
        delete server.user;
        await SecureStore.setItemAsync(serverId, JSON.stringify(server));
    }
    else {
        throw new Error('Server not found');
    }
};

export const getCurrentServerCredentials = async () => {
    const currentServer = await getCurrentServer();
    return currentServer?.user;
};

export const getCurrentTheme = async () => {
    const currentServerId = await getCurrentServerId();
    const theme = currentServerId ? await AsyncStorage.getItem(`${currentServerId}-theme`) : null;
    return theme ? JSON.parse(theme) as MakerspaceTheme : null;
};

export const setTheme = async (theme: MakerspaceTheme, serverId?: string) => {
    await AsyncStorage.setItem(`${serverId}-theme`, JSON.stringify(theme));
};

