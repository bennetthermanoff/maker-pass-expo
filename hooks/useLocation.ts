import { useEffect, useState } from 'react';
import { LocationGroupBody, LocationGroupMap, MachineGroupMap } from '../types/machine';
import { MakerspaceConfig } from '../types/makerspaceServer';
import { useSelector } from 'react-redux';
import { selectLocationGroups, selectMachineGroups } from '../state/slices/machinesSlice';
import { addOrUpdateServer } from '../util/makerspaces';
import { currentServerSelector } from '../state/slices/makerspacesSlice';

export const useLocation = () => {
    const [location, setLocation] = useState<LocationGroupBody|null>(null);
    const locationMap = useSelector(selectLocationGroups)as LocationGroupMap;
    const machineGroups = useSelector(selectMachineGroups)as MachineGroupMap;
    const makerspace = useSelector(currentServerSelector);
    useEffect(() => {
        setLocation(getCurrentLocation(makerspace, machineGroups, locationMap));
    }, [makerspace, machineGroups, locationMap]);
    return { location, locationMap };
};
export const getCurrentLocation = (makerspace:MakerspaceConfig|null, machineGroups:MachineGroupMap, locationMap:LocationGroupMap) => {
    if (!makerspace){
        return null;
    }
    if (makerspace?.currentLocation){
        const location = locationMap[makerspace.currentLocation];
        if (location){
            return location;
        }
    } else {
        if ( Object.keys(locationMap).length > 0 && makerspace){
            //set default location to first location
            const location = Object.keys(locationMap)[0];
            addOrUpdateServer({ ...makerspace, currentLocation: location });
            return locationMap[Object.keys(locationMap)[0]];
        }
    }
    // we have no locations, so default to makerspace name and all groups
    const machineGroupIds = Object.keys(machineGroups);
    addOrUpdateServer({ ...makerspace, currentLocation: undefined });
    return {
        name: makerspace?.name || '',
        groups: machineGroupIds,
        geoFences: [],
    }as LocationGroupBody;
};