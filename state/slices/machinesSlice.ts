import { createAsyncThunk, createSlice, Dispatch } from '@reduxjs/toolkit';
import { has, update } from 'lodash';
import { LocationGroupArray, LocationGroupMap, Machine, MachineGroupArray, MachineGroupMap } from '../../types/machine';
import { MakerspaceConfig } from '../../types/makerspaceServer';
import { disableMachineRoute, getMachinesFromServer } from '../../hooks/useMachines';
import { getImage, getImageIDs, setImage } from '../../util/machineImageCache';
import { cacheCurrentLocation, getLocation } from '../../util/locationCache';
import { getLocationGroupsFromServer, getMachineGroupsFromServer } from '../../hooks/useMachineGroups';
import { addOrUpdateServer } from '../../util/makerspaces';

export const machinesSlice = createSlice({
    name: 'machines',
    initialState: {
        machines: [] as Machine[],
        machineGroups: {} as MachineGroupMap,
        locationGroups: {} as LocationGroupMap,
        loading: false,
    },
    reducers: {
        addMachine(state, action) {
            state.machines.push(action.payload);
        },
        removeMachine(state, action) {
            state.machines = state.machines.filter((machine) => machine.id !== action.payload.id);
        },
        updateMachine(state, action) {
            const index = state.machines.findIndex((machine) => machine.id === action.payload.id);
            if (index !== -1) {
                state.machines[index] = { ...state.machines[index], ...action.payload };
            }
        },
        updateMachines(state, action) {
            state.machines = action.payload;
        },

        updateMachineGroups(state, action) {
            state.machineGroups = action.payload;
        },

        updateLocationGroups(state, action) {
            state.locationGroups = action.payload;
        },

        setLoading(state, action) {
            state.loading = action.payload;
        },

    },
});

export const { addMachine, removeMachine, updateMachine, updateMachines, setLoading, updateMachineGroups, updateLocationGroups } = machinesSlice.actions;

// REDUX THUNKS

export const fetchMachines = (makerspace:MakerspaceConfig) => async (dispatch:any) => {
    dispatch(setLoading(true));
    if (makerspace?.user){
        let machines = await getMachinesFromServer(makerspace,false);
        const cachedImageIds = await getImageIDs();
        machines = await Promise.all(machines.map(async (machine) => {
            if (machine.photoHash){
                const image = await getImage(machine.photoHash);
                return { ...machine, photo: image };
            }
            return machine;
        }));
        dispatch(updateMachines(machines));
        if (makerspace.hasGeoFences){
            cacheCurrentLocation();
        }
        const allMachinesHaveImages = machines.every((machine) => !machine.photoHash || cachedImageIds.includes(machine.photoHash));
        if (!allMachinesHaveImages){
            machines = await getMachinesFromServer(makerspace,true);
            dispatch(updateMachines(machines));
            for (const machine of machines){
                if (machine.photo && machine.photoHash){
                    await setImage(machine.photoHash, machine.photo);
                }
            }
        }
    }
    dispatch(setLoading(false));
};
export const disableMachine =  createAsyncThunk(
    'machines/disableMachine',
    async ({ machineId, makerspace }: { machineId:string, makerspace:MakerspaceConfig }, { dispatch }) => {
        dispatch(setLoading(true));
        if (makerspace?.user){
            const { machine:updatedMachine } = await disableMachineRoute(machineId, makerspace);
            dispatch(updateMachine(updatedMachine));
        }
        dispatch(setLoading(false));
    },
);

export const fetchMachineGroups = (makerspace:MakerspaceConfig) => async (dispatch:Dispatch) => {
    dispatch(setLoading(true));
    if (makerspace?.user){
        const mgm = await getMachineGroupsFromServer(makerspace);
        dispatch(updateMachineGroups(mgm));
    }
    updateMakerspaceHasGeoFences(makerspace);
    dispatch(setLoading(false));
};

export const updateMakerspaceHasGeoFences = (makerspace:MakerspaceConfig) => (state:any) => {
    const machineGroups = selectMachineGroups(state);
    const locationGroups = selectLocationGroups(state);
    const hasMachineGroupsWithGeoFences = Object.values(machineGroups).some((group) => group.geoFences.length > 0)
                                       || Object.values(locationGroups).some((group) => group.geoFences.length > 0);
    if (hasMachineGroupsWithGeoFences !== makerspace.hasGeoFences){
        addOrUpdateServer({ ...makerspace, hasGeoFences:hasMachineGroupsWithGeoFences });
    }

};

export const fetchLocationGroups = (makerspace:MakerspaceConfig) => async (dispatch:Dispatch) => {
    dispatch(setLoading(true));
    if (makerspace?.user){
        const lgm = await getLocationGroupsFromServer(makerspace);
        dispatch(updateLocationGroups(lgm));
    }
    updateMakerspaceHasGeoFences(makerspace);
    dispatch(setLoading(false));
};

// SELECTORS
export const selectMachines = (state:any) => state.machines.machines as Machine[];
export const selectMachineGroups = (state:any) => state.machines.machineGroups as MachineGroupMap;
export const selectLoading = (state:any) => state.machines.loading as boolean;
export const selectLocationGroups = (state:any) => state.machines.locationGroups as LocationGroupMap;

export const selectMachinesByGroup = (state:any, groupId:string) => {
    const machines = selectMachines(state);
    const machineGroups = selectMachineGroups(state);
    const group = machineGroups[groupId];
    if (group){
        return machines.filter((machine) => group.machineIds.includes(machine.id));
    }
    return [];
};

export const selectMachineGroupAsArray = (state:any) => {
    const machineGroups = selectMachineGroups(state);
    const machineGroupArray:MachineGroupArray = [];
    for (const id in machineGroups){
        machineGroupArray.push({ ...machineGroups[id], id });
    }
    return machineGroupArray;
};
export const selectLocationGroupsAsArray = (state:any) => {
    const locationGroups = selectLocationGroups(state);
    const locationGroupArray:LocationGroupArray = [];
    for (const id in locationGroups){
        locationGroupArray.push({ ...locationGroups[id], id });
    }
    return locationGroupArray;
};

export const selectActiveMachinesForUserFactory = (makerspace:MakerspaceConfig|null) => (state:any) => {
    if (!makerspace?.user){
        return [];
    }

    const machines = selectMachines(state);
    if ( makerspace?.user?.userType === 'user'){
        //only show machines that the user activated
        return machines.filter((machine) => machine.lastUsedBy === makerspace.user?.userId);
    }
    else {
        //show  all machines in current location (TODO: LOCATION NOT IMPLEMENTED YET)
        return machines.filter((machine) => machine.enabled);
    }
};

