import { createSelector, createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { PermissionGroupMap } from '../../types/machine';
import { MakerspaceConfig } from '../../types/makerspaceServer';
import { PermissionObject } from '../../types/user';
import { getAuthHeaders } from '../../util/authRoutes';
import { RootState } from '../store';
import { currentServerSelector } from './makerspacesSlice';

interface PermissionsState {
    permissionUserMap: Record<string,PermissionObject>;
    permissionGroups: PermissionGroupMap;
    loading:boolean
}

export const permissionsSlice = createSlice({
    name: 'permissions',
    initialState:{
        permissionUserMap:{},
        permissionGroups:{},
        loading:false,
    } as PermissionsState,
    reducers:{
        updateUserPermission(state,action:PayloadAction<{userId:string, permissions:PermissionObject}>){
            state.permissionUserMap[action.payload.userId] = action.payload.permissions;
        },
        bulkUpdateUserPermissions(state, action:PayloadAction<Record<string,PermissionObject>>){
            state.permissionUserMap = { ...state.permissionUserMap, ...action.payload };
        },

        updatePermissionGroups(state, action:PayloadAction<PermissionGroupMap>){
            state.permissionGroups = action.payload;
        },

        setLoading(state,action:PayloadAction<boolean>){
            state.loading = action.payload;
        },
    },
});

export const {
    updateUserPermission,
    bulkUpdateUserPermissions,
    updatePermissionGroups,
    setLoading,
} = permissionsSlice.actions;

export const fetchPermissionsForUser = (makerspace:MakerspaceConfig) => async (dispatch:Dispatch) => {
    const userId = makerspace.user?.userId;
    if (userId){
        dispatch(setLoading(true));
        axios.get(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/userPermissions/${userId}`, getAuthHeaders(makerspace)).then((response) => {
            const permissions = response.data as PermissionObject;
            dispatch(updateUserPermission({ userId, permissions }));
        });
        dispatch(setLoading(false));
    }
};

export const fetchPermissionGroups = (makerspace:MakerspaceConfig) => async (dispatch:Dispatch) => {
    dispatch(setLoading(true));
    const response = await axios.get(
        `${makerspace.serverAddress}:${makerspace.serverPort}/api/permissionGroup/all`,
        getAuthHeaders(makerspace),
    );
    const permissionGroupMap = response.data as PermissionGroupMap;
    dispatch(setLoading(false));
    dispatch(updatePermissionGroups(permissionGroupMap));
};

export const selectPermissionGroups = (state:RootState) => state.permissions.permissionGroups;
export const selectUserPermissionMap = (state:RootState) => state.permissions.permissionUserMap;
export const selectUserPermissions = (userId:string) => createSelector(
    [selectUserPermissionMap, (state:any) => userId],
    (permissionGroupMap, userId) => permissionGroupMap[userId],
);
export const selectCurrentUserPermissions = createSelector(
    [selectUserPermissionMap, currentServerSelector],
    (userPermissions, makerspace) => {
        const userId = makerspace?.user?.userId;
        if (!userId){
            return { groups:[],machines:[] };
        }
        return userPermissions[userId];
    },
);
