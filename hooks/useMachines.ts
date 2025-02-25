import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { GLOBAL } from '../global';
import { currentServerSelector, handleLoginError } from '../state/slices/makerspacesSlice';
import { useAppDispatch } from '../state/store';
import { Machine } from '../types/machine';
import { cacheCurrentLocation } from '../util/locationCache';
import { getImage, getImageIDs, setImage } from '../util/machineImageCache';
import { disableMachineRoute, getMachinesFromServer } from '../util/machineRoutes';

export const useMachines = () => {
    const [machines, setMachines] = useState <Array<Machine&{lastUsedByName:string|null}>>([]);
    const makerspace = useSelector(currentServerSelector);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null|string>(null);
    const dispatch = useAppDispatch();

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
                dispatch(handleLoginError());
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
                dispatch(handleLoginError());
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

