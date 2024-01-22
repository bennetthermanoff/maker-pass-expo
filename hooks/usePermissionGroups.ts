import { useEffect, useState } from 'react';
import { useMakerspace } from './useMakerspace';
import { Machine, MachineGroupArray, MachineGroupMap, PermissionGroup, PermissionGroupArray } from '../types/machine';
import { getMachinesFromServer } from './useMachines';
import { debounce } from 'lodash';
import { GLOBAL } from '../global';
import { MakerspaceConfig } from '../types/makerspaceServer';
import axios from 'axios';
import { getAuthHeaders } from '../util/authRoutes';

export const usePermissionGroups = () => {
    const [permissionGroups,setMachineGroups] = useState<PermissionGroupArray>([]);
    const [machines,setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null|string>(null);
    const makerspace = useMakerspace();

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