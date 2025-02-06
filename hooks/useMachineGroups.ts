import { useEffect, useState } from 'react';
import { LocationGroupMap, Machine, MachineGroupArray, MachineGroupMap } from '../types/machine';
import { useMakerspace } from './useMakerspace';
import { MakerspaceConfig } from '../types/makerspaceServer';
import { getAuthHeaders } from '../util/authRoutes';
import axios from 'axios';
import { debounce } from 'lodash';
import { GLOBAL } from '../global';
import { getMachinesFromServer } from './useMachines';
import { addOrUpdateServer } from '../util/makerspaces';

// export const useMachineGroups = () => {
//     const [machineGroups,setMachineGroups] = useState<MachineGroupArray>([]);
//     const [machines,setMachines] = useState<Machine[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<null|string>(null);
//     const makerspace = useMakerspace();

//     const getMachineGroups = async () => {
//         setLoading(true);
//         try {
//             if (makerspace?.user){
//                 getMachineGroupsFromServer(makerspace).then((machineGroups) => {
//                     const machineGroupArray = [];
//                     for (const id in machineGroups ){
//                         machineGroupArray.push({ ...machineGroups[id], id });
//                     }
//                     setMachineGroups(machineGroupArray);
//                 });
//                 getMachinesFromServer(makerspace,false).then((machines) => {
//                     setMachines(machines);
//                 });
//             }
//         }
//         catch (err){
//             setError(JSON.stringify(err));
//         }
//         finally {
//             setLoading(false);
//         }
//     };
//     const debouncedGetMachineGroups = debounce(getMachineGroups,200);

//     useEffect(() => {
//         getMachineGroups();
//         GLOBAL.getMachineGroups = getMachineGroups;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     },[makerspace]);
//     return { machineGroups, loading, error, debouncedGetMachineGroups, machines };
// };

export const getMachineGroupsFromServer = async (makerspace:MakerspaceConfig) => {
    try {
        const { data }:{data:MachineGroupMap} = await axios.get(
            `${makerspace.serverAddress}:${makerspace.serverPort}/api/machineGroup/all`,
            getAuthHeaders(makerspace),
        );
        return data;
    }
    catch (e){
        return {};
    }
};

export const getLocationGroupsFromServer = async (makerspace:MakerspaceConfig) => {
    try {
        const { data }:{data:LocationGroupMap} = await axios.get(
            `${makerspace.serverAddress}:${makerspace.serverPort}/api/locationGroups/all`,
            getAuthHeaders(makerspace),
        );
        return data;
    }
    catch (e){
        return {};
    }
};