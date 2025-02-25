import axios from 'axios';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { GLOBAL } from '../global';
import { selectMachines } from '../state/slices/machinesSlice';
import { currentServerSelector } from '../state/slices/makerspacesSlice';
import { MachineGroupMap, PermissionGroupArray } from '../types/machine';
import { MakerspaceConfig } from '../types/makerspaceServer';
import { getAuthHeaders } from '../util/authRoutes';

export const usePermissionGroups = () => {
    const [permissionGroups,setPermissiongroups] = useState<PermissionGroupArray>([]);
    const machines = useSelector(selectMachines);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null|string>(null);
    const makerspace = useSelector(currentServerSelector);

    const getPermissiongroups = async () => {
        setLoading(true);
        try {
            if (makerspace?.user){
                getPermissiongroupsFromServer(makerspace).then((permissionGroups) => {
                    const permissionGroupArray = [];
                    for (const id in permissionGroups ){
                        permissionGroupArray.push({ ...permissionGroups[id], id });
                    }
                    setPermissiongroups(permissionGroupArray);
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
    const debouncedGetPermissionGroups = debounce(getPermissiongroups,200);

    useEffect(() => {
        getPermissiongroups();
        GLOBAL.getMachineGroups = getPermissiongroups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[makerspace]);
    return { permissionGroups, loading, error,  debouncedGetPermissionGroups, machines, makerspace };
};

export const getPermissiongroupsFromServer = async (makerspace:MakerspaceConfig) => {
    const response = await axios.get(
        `${makerspace.serverAddress}:${makerspace.serverPort}/api/permissionGroup/all`,
        getAuthHeaders(makerspace),
    );
    return response.data as MachineGroupMap;
};