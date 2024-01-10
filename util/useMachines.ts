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
import { getImage, getImageIDs, setImage } from './machineImageCache';
import { GLOBAL } from '../global';

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
                let machines = await getMachinesFromServer(makerspace,false);
                const cachedImageIds = await getImageIDs();
                const allMachinesHaveImages = machines.every((machine) => !machine.photoHash || cachedImageIds.includes(machine.photoHash));
                if (!allMachinesHaveImages){
                    machines = await getMachinesFromServer(makerspace,true);
                    machines.forEach((machine) => {
                        if (machine.photo && machine.photoHash){
                            setImage(machine.photoHash, machine.photo);
                        }
                    });
                } else {
                    machines = await Promise.all(machines.map(async (machine) => {
                        if (machine.photoHash){
                            const image = await getImage(machine.photoHash);
                            return { ...machine, photo: image };
                        }
                        return machine;
                    }));}
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
        GLOBAL.getMachines = getMachines;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [makerspace]);

    return { machines, loading, error, debouncedGetMachines, disableMachine };
};

export const getMachinesFromServer = async (makerspace:MakerspaceConfig, withImages?:boolean) => {
    const response = await axios.get(
        `${makerspace.serverAddress}:${makerspace.serverPort}/api/machine/all${withImages ? '/photos' : ''}`,
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

