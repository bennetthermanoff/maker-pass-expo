import axios from 'axios';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { GLOBAL } from '../global';
import { currentServerSelector } from '../state/slices/makerspacesSlice';
import { Machine, MachineGroupMap, PermissionGroupArray } from '../types/machine';
import { MakerspaceConfig } from '../types/makerspaceServer';
import { getAuthHeaders } from '../util/authRoutes';
import { getMachinesFromServer } from './useMachines';

export const usePermissionGroups = () => {
    const [permissionGroups,setMachineGroups] = useState<PermissionGroupArray>([]);
    const [machines,setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null|string>(null);
    const makerspace = useSelector(currentServerSelector);

    const getMachineGroups = async () => {
        setLoading(true);
        try {
            if (makerspace?.user){
                getMachineGroupsFromServer(makerspace).then((permissionGroups) => {
                    const permissionGroupArray = [];
                    for (const id in permissionGroups ){
                        permissionGroupArray.push({ ...permissionGroups[id], id });
                    }
                    setMachineGroups(permissionGroupArray);
                });
                getMachinesFromServer(makerspace,false).then((machines) => {
                    setMachines(machines);
                });
            }
        }
        catch (err){
            setError(JSON.stringify(err));
        }
        finally {
            setLoading(false);
        }
    };
    const debouncedGetPermissionGroups = debounce(getMachineGroups,200);

    useEffect(() => {
        getMachineGroups();
        GLOBAL.getMachineGroups = getMachineGroups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[makerspace]);
    return { permissionGroups, loading, error,  debouncedGetPermissionGroups, machines, makerspace };
};

export const getMachineGroupsFromServer = async (makerspace:MakerspaceConfig) => {
    const response = await axios.get(
        `${makerspace.serverAddress}:${makerspace.serverPort}/api/permissionGroup/all`,
        getAuthHeaders(makerspace),
    );
    return response.data as MachineGroupMap;
};