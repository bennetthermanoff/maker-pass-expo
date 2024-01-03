import { useEffect, useState } from 'react';
import { Machine } from '../types/machine';
import { debounce } from 'lodash';
import axios from 'axios';
import { useMakerspace } from './useMakerspace';
import { MakerspaceConfig } from '../types/makerspaceServer';
import { clearStackGoTo } from './clearStackGoTo';
import { router } from 'expo-router';
import { handleUserLoginError } from './goHome';
import { getAuthHeaders } from './authRoutes';

export const useMachines = () => {
    const [machines, setMachines] = useState<null|Machine[]>(null);
    const makerspace = useMakerspace();
    // const [machineGroups, setMachineGroups] = useState<null|MachineGroup[]>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null|string>(null);

    const getMachines = async () => {
        setLoading(true);
        try {
            if (makerspace?.user){
                const machines = await getMachinesFromServer(makerspace);
                setMachines(machines);
            }
        }
        catch (err:any){
            if (err.response.status === 401){
                handleUserLoginError();
            }
            setError(JSON.stringify(err));
        }
        finally {
            setLoading(false);
        }
    };
    const debouncedGetMachines = debounce(getMachines, 1000);

    const disableMachine = async (machineId:string) => {
        setLoading(true);
        try {
            if (makerspace?.user){
                const { machine:updatedMachine, message } = await disableMachineRoute(machineId, makerspace);
                const updatedMachines = machines?.map((machine) => {
                    if (machine.id === machineId){
                        return updatedMachine;
                    }
                    return machine;
                });
                if (updatedMachines){
                    setMachines(updatedMachines);
                }
            }
        } catch (err:any){
            alert(err);
            if (err.response.status === 401){
                handleUserLoginError();
            }
            setError(JSON.stringify(err));
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getMachines();
    }, [makerspace]);

    return { machines, loading, error, debouncedGetMachines, disableMachine };
};

export const getMachinesFromServer = async (makerspace:MakerspaceConfig) => {
    const response = await axios.get(
        `${makerspace.serverAddress}:${makerspace.serverPort}/api/machine/all`,
        getAuthHeaders(makerspace),
    );
    return response.data.machines as Machine[];
};

export const disableMachineRoute = async (machineId:string, makerspace:MakerspaceConfig) => {
    const response = await axios.get(
        `${makerspace.serverAddress}:${makerspace.serverPort}/api/machine/disable/single/${machineId}`,
        getAuthHeaders(makerspace),
    );
    return response.data as {message:string, machine:Machine};
};

