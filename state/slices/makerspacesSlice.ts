import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { MakerspaceConfig, MakerspaceServers as MakerspaceServerIds, MakerspaceTheme } from '../../types/makerspaceServer';

interface MakerspacesState {
    serverMap:{[serverId:string]:MakerspaceConfig}
    currentServerId: string|null;
    darkMode: boolean;
}

const initialState: MakerspacesState = {
    serverMap: {},
    currentServerId: null,
    darkMode: false,
};
const DefaultTheme:MakerspaceTheme = { primary:'blue',secondary:'green' };

export const fetchServers = createAsyncThunk('makerspaces/fetchServers', async () => {
    const serversString = await SecureStore.getItemAsync('servers');
    const serverIds = serversString ? JSON.parse(serversString) as MakerspaceServerIds : [];
    const servers = await Promise.all(serverIds.map(async (serverId) => {
        const server = await SecureStore.getItemAsync(serverId);
        return server ? JSON.parse(server) as MakerspaceConfig : null;
    }));
    return servers.filter((server) => server !== null) as MakerspaceConfig[];
});

export const fetchCurrentServerId = createAsyncThunk('makerspaces/fetchCurrentServer', async () => {
    const currentServerId = await AsyncStorage.getItem('currentServer');
    return currentServerId;
});

export const makerspacesSlice = createSlice({
    name: 'makerspaces',
    initialState,
    reducers: {
        addOrUpdateServer: (state, action: PayloadAction<MakerspaceConfig>) => {
            const updatedServer = action.payload;
            const existingServer = state.serverMap[updatedServer.id];
            if (existingServer) {
                state.serverMap[updatedServer.id] = { ...existingServer, ...updatedServer };
            } else {
                state.serverMap[updatedServer.id] = updatedServer;
            }

            SecureStore.setItemAsync(updatedServer.id, JSON.stringify(updatedServer));
            SecureStore.setItemAsync('servers', JSON.stringify(Object.keys(state.serverMap)));
            AsyncStorage.setItem(`${updatedServer.id}-theme`, JSON.stringify(updatedServer.theme));
            AsyncStorage.setItem('currentServer', updatedServer.id);
            state.currentServerId = updatedServer.id;
        },
        removeServer: (state, action: PayloadAction<string>) => {
            const serverId = action.payload;
            state.serverMap = Object.fromEntries(Object.entries(state.serverMap).filter(([key]) => key !== serverId));
            SecureStore.deleteItemAsync(serverId);
            SecureStore.setItemAsync('servers', JSON.stringify(Object.keys(state.serverMap)));
            AsyncStorage.removeItem(`${serverId}-theme`);
            if (state.currentServerId === serverId) {
                state.currentServerId = null;
                AsyncStorage.removeItem('currentServer');
            }
        },
        setCurrentServer: (state, action: PayloadAction<string>) => {
            const serverId = action.payload;
            state.currentServerId = serverId;
            AsyncStorage.setItem('currentServer', serverId);
        },
        clearServers: (state) => {
            state.serverMap = {};
            state.currentServerId = null;
            SecureStore.deleteItemAsync('servers');
            AsyncStorage.removeItem('currentServer');
        },
        addServerCredentials: (state, action: PayloadAction<{ serverId: string, userId: string, userType: string, token: string }>) => {
            const { serverId, userId, userType, token } = action.payload;
            const server = state.serverMap[serverId];
            if (server) {
                server.user = { userId, userType, token };
                SecureStore.setItemAsync(serverId, JSON.stringify(server));
            } else {
                throw new Error('Server not found');
            }
        },
        removeServerCredentials: (state, action: PayloadAction<string>) => {
            const serverId = action.payload;
            const server = state.serverMap[serverId];
            if (server) {
                delete server.user;
                SecureStore.setItemAsync(serverId, JSON.stringify(server));
            } else {
                throw new Error('Server not found');
            }
        },
        setTheme: (state, action: PayloadAction<{ theme: MakerspaceTheme, serverId?: string }>) => {
            const { theme, serverId } = action.payload;
            AsyncStorage.setItem(`${serverId}-theme`, JSON.stringify(theme));
        },
        setDarkMode: (state, action: PayloadAction<boolean>) => {
            state.darkMode = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchServers.fulfilled, (state, action) => {
            state.serverMap = Object.fromEntries(action.payload.map((server) => [server.id, server]));
        });
        builder.addCase(fetchCurrentServerId.fulfilled, (state, action) => {
            state.currentServerId = action.payload;
        });
    },
});

export const {
    addOrUpdateServer,
    removeServer,
    setCurrentServer,
    clearServers,
    addServerCredentials,
    removeServerCredentials,
    setTheme,
} = makerspacesSlice.actions;

export const currentServerSelector = (state: { makerspaces: MakerspacesState }) => {
    const currentServerId = state.makerspaces.currentServerId;
    return currentServerId ? state.makerspaces.serverMap[currentServerId] : null;
};

export const serversSelector = (state: { makerspaces: MakerspacesState }) => state.makerspaces.serverMap;

export const currentThemeSelector = (state: { makerspaces: MakerspacesState }) => {
    const currentServerId = state.makerspaces.currentServerId;
    const theme = currentServerId ? state.makerspaces.serverMap[currentServerId]?.theme : null;
    return theme || DefaultTheme;
};

export const darkModeSelector = (state: { makerspaces: MakerspacesState }) => state.makerspaces.darkMode;
