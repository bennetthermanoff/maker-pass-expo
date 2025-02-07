import { useEffect, useState } from 'react';
import { LocationGroupMap, Machine, MachineGroupArray, MachineGroupMap } from '../types/machine';
import { MakerspaceConfig } from '../types/makerspaceServer';
import { getAuthHeaders } from '../util/authRoutes';
import axios from 'axios';
import { debounce } from 'lodash';
import { GLOBAL } from '../global';
import { getMachinesFromServer } from './useMachines';
import { addOrUpdateServer } from '../util/makerspaces';

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