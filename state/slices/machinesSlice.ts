import { createAsyncThunk, createSlice, Dispatch } from '@reduxjs/toolkit';
import { update } from 'lodash';
import { Machine, MachineGroupArray, MachineGroupMap } from '../../types/machine';
import { MakerspaceConfig } from '../../types/makerspaceServer';
import { disableMachineRoute, getMachinesFromServer } from '../../hooks/useMachines';
import { getImage, getImageIDs, setImage } from '../../util/machineImageCache';
import { cacheCurrentLocation } from '../../util/locationCache';
import { getMachineGroupsFromServer } from '../../hooks/useMachineGroups';

export const machinesSlice = createSlice({
    name: 'machines',
    initialState: {
        machines: [] as Machine[],
        machineGroups: {} as MachineGroupMap,
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

        setLoading(state, action) {
            state.loading = action.payload;
        },

    },
});

export const { addMachine, removeMachine, updateMachine, updateMachines, setLoading, updateMachineGroups } = machinesSlice.actions;

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
    dispatch(setLoading(false));
};

// SELECTORS
export const selectMachines = (state:any) => state.machines.machines as Machine[];
export const selectMachineGroups = (state:any) => state.machines.machineGroups as MachineGroupMap;
export const selectLoading = (state:any) => state.machines.loading as boolean;

export const selectMachinesByGroup = (state:any, groupId:string) => {
    const machines = selectMachines(state);
    const machineGroups = selectMachineGroups(state);
    const group = machineGroups[groupId];
    if (group){
        return machines.filter((machine) => group.machineIds.includes(machine.id));
    }
    return [];
};

