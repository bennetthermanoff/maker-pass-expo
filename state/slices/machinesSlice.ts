import { createAsyncThunk, createSelector, createSlice, Dispatch } from '@reduxjs/toolkit';
import { getLocationGroupsFromServer, getMachineGroupsFromServer } from '../../hooks/useMachineGroups';
import { LocationGroupArray, LocationGroupBody, LocationGroupMap, Machine, MachineGroupArray, MachineGroupMap } from '../../types/machine';
import { MakerspaceConfig } from '../../types/makerspaceServer';
import { cacheCurrentLocation } from '../../util/locationCache';
import { getImage, getImageIDs, setImage } from '../../util/machineImageCache';
import { disableMachineRoute, getMachinesFromServer } from '../../util/machineRoutes';
import { RootState } from '../store';
import { addOrUpdateServer, currentServerSelector, handleLoginError } from './makerspacesSlice';
import { selectCurrentUserPermissions, selectPermissionGroups } from './permissionsSlice';

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
export const fetchMachines = (makerspace:MakerspaceConfig) => async (dispatch:Dispatch) => {
    dispatch(setLoading(true));
    if (makerspace?.user){
        let machines = await getMachinesFromServer(makerspace,false).catch((err) => {
            if (err.response.status === 401){
                dispatch(handleLoginError());
                return [];
            }}).then((machines) => machines as Array<Machine>);
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
    console.log('FINISHED FETCHING MACHINES');

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
    console.log('FINISHED FETCHING MACHINE GROUPS');

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
    console.log('FINISHED FETCHING LOCATION GROUPS');
    dispatch(setLoading(false));
};

// SELECTORS
export const selectMachines = (state:RootState) => state.machines.machines;
export const selectMachineGroups = (state:RootState) => state.machines.machineGroups as MachineGroupMap;
export const selectLoading = (state:RootState) => state.machines.loading as boolean;
export const selectLocationGroups = (state:RootState) => state.machines.locationGroups;

export const selectMachinesByGroup = (state:any, groupId:string) => {
    const machines = selectMachines(state);
    const machineGroups = selectMachineGroups(state);
    const group = machineGroups[groupId];
    if (group){
        return machines.filter((machine) => group.machineIds.includes(machine.id));
    }
    return [];
};

export const selectMachineGroupAsArray = (state:RootState) => {
    const machineGroups = selectMachineGroups(state);
    const machineGroupArray:MachineGroupArray = [];
    for (const id in machineGroups){
        machineGroupArray.push({ ...machineGroups[id], id });
    }
    return machineGroupArray;
};
export const selectLocationGroupsAsArray = (state:RootState) => {
    const locationGroups = selectLocationGroups(state);
    const locationGroupArray:LocationGroupArray = [];
    for (const id in locationGroups){
        locationGroupArray.push({ ...locationGroups[id], id });
    }
    return locationGroupArray;
};
export const selectCurrentLocationGroup = createSelector(
    [currentServerSelector, selectMachineGroups, selectLocationGroups],
    (makerspace:MakerspaceConfig|null, machineGroups:MachineGroupMap, locationMap:LocationGroupMap) => {
        if (!makerspace){
            return null;
        }
        if (makerspace?.currentLocation && makerspace.currentLocation in locationMap){
            const location = locationMap[makerspace.currentLocation];
            if (location){
                return location;
            }
        } else {
            if ( Object.keys(locationMap).length > 0 && makerspace){
                return locationMap[Object.keys(locationMap)[0]];
            }
        }
        // we have no locations, so default to makerspace name and all groups
        const machineGroupIds = Object.keys(machineGroups);
        return {
            name: makerspace?.name || '',
            groups: machineGroupIds,
            geoFences: [],
        }as LocationGroupBody;
    },
);

export const selectActiveMachinesForUserFactory = (makerspace: MakerspaceConfig | null) =>
    createSelector(
        [selectMachines, selectLocationGroups, selectMachineGroups, (state: any) => makerspace ],
        (machines, locationGroups, machineGroups, makerspace) => {
            if (!makerspace?.user) {
                return [];
            }

            if (makerspace.user.userType === 'user') {
            // only show machines that the user activated
                return machines.filter((machine) => machine.lastUsedBy === makerspace.user?.userId);
            } else {
                // show all active machines in current location
                if (!makerspace.currentLocation){
                    return machines.filter((machine) => machine.enabled);
                }
                const currentLocationId = makerspace.currentLocation;
                const machinesInLocation = findMachineIdsInLocationGroups({ currentLocationId, locationGroups, machineGroups });
                return machines.filter((machine) => machine.enabled && machinesInLocation.includes(machine.id));
            }
        },
    );

export const findMachineIdsInLocationGroups = ({ currentLocationId, locationGroups, machineGroups }:
        { currentLocationId:string, locationGroups:LocationGroupMap, machineGroups:MachineGroupMap }) => {
    const machineIds:string[] = [];
    const locationGroup = locationGroups[currentLocationId];
    if (locationGroup){
        locationGroup.groups.forEach((groupId) => {
            const group = machineGroups[groupId];
            if (group){
                machineIds.push(...group.machineIds);
            }
        });
    }
    return machineIds;
};
export const selectMachinesInCurrentLocation = createSelector(
    [selectMachines, selectCurrentLocationGroup, selectMachineGroups],
    (machines, currentLocation, machineGroups) => {
        if (!currentLocation){
            return machines;
        }
        const machineIds:string[] = [];
        currentLocation.groups.forEach((groupId) => {
            const group = machineGroups[groupId];
            if (group){
                machineIds.push(...group.machineIds);
            }
        });
        return machines.filter((machine) => machineIds.includes(machine.id));
    },
);

export const selectYourMachinesForUser = createSelector(
    [selectMachinesInCurrentLocation, selectCurrentUserPermissions, selectPermissionGroups],
    (machines, userPermissions, permissionGroupMap) => {
        console.log('machines', machines.length);

        const machinesByGroupId = {} as Record<string,Machine[]>;
        userPermissions?.groups.forEach((group) => {
            if (group.permission){
                const machineIds = permissionGroupMap[group.id]?.machineIds;
                machinesByGroupId[group.id] = machines.filter((machine) => machineIds?.includes(machine.id));
            }
        });
        const otherMachineIds:string[] = [];
        userPermissions?.machines.forEach((machine) => {
            otherMachineIds.push(machine.id);
        });
        console.log('otherMachineIds', otherMachineIds);

        machinesByGroupId.OTHER = machines.filter((machine) => otherMachineIds.includes(machine.id));
        console.log('machinesByGroupId', machinesByGroupId.OTHER.length);

        return { machinesByGroupId, permissionGroupMap };
    },
);