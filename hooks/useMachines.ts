import { useEffect, useState } from 'react';
import { Machine, MachineGroupArray, TagOut } from '../types/machine';
import { debounce } from 'lodash';
import axios from 'axios';
import { useMakerspace } from './useMakerspace';
import { MakerspaceConfig } from '../types/makerspaceServer';
import { clearStackGoTo } from '../util/clearStackGoTo';
import { router } from 'expo-router';
import { handleUserLoginError } from '../util/goHome';
import { getAuthHeaders } from '../util/authRoutes';
import { getImage, getImageIDs, setImage } from '../util/machineImageCache';
import { GLOBAL } from '../global';
import { cacheCurrentLocation } from '../util/locationCache';

export const useMachines = () => {
    const [machines, setMachines] = useState <Array<Machine&{lastUsedByName:string|null}>>([]);
    const makerspace = useMakerspace();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null|string>(null);

    const getMachines = async () => {
        setLoading(true);
        try {
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
                setMachines(machines);
                if (makerspace.hasGeoFences){
                    cacheCurrentLocation();
                }
                const allMachinesHaveImages = machines.every((machine) => !machine.photoHash || cachedImageIds.includes(machine.photoHash));
                if (!allMachinesHaveImages){
                    machines = await getMachinesFromServer(makerspace,true);
                    setMachines(machines);
                    for (const machine of machines){
                        if (machine.photo && machine.photoHash){
                            await setImage(machine.photoHash, machine.photo);
                        }
                    }
                }
            }

        }
        catch (err:any){
            if (err.response.status === 401){
                handleUserLoginError();
            }
            setError(JSON.stringify(err.response.data));
            setLoading(false);

        }
        finally {
            setLoading(false);
        }
    };

    const disableMachine = async (machineId:string) => {
        setLoading(true);
        try {
            if (makerspace?.user){
                const { machine:updatedMachine, message } = await disableMachineRoute(machineId, makerspace);
                const updatedMachines = machines?.map((machine) => {
                    if (machine.id === machineId){
                        return { ...machine, ...updatedMachine };
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

    return { machines, loading, error, getMachines, disableMachine, makerspace };
};

export const getMachinesFromServer = async (makerspace:MakerspaceConfig, withImages?:boolean) => {
    const response = await axios.get(
        `${makerspace.serverAddress}:${makerspace.serverPort}/api/machine/all${withImages ? '/photos' : ''}`,
        getAuthHeaders(makerspace),
    );
    return response.data.machines as Array<Machine & {lastUsedByName:string|null}>;
};

export const disableMachineRoute = async (machineId:string, makerspace:MakerspaceConfig) => {
    const response = await axios.get(
        `${makerspace.serverAddress}:${makerspace.serverPort}/api/machine/disable/single/${machineId}`,
        getAuthHeaders(makerspace),
    );
    return response.data as {message:string, machine:Machine};
};

