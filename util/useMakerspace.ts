import { useEffect, useState } from 'react';
import { MakerspaceConfig } from '../types/makerspaceServer';
import { getCurrentServer } from './makerspaces';
import { GLOBAL } from '../global';

export const useMakerspace = () => {
    const [makerspace, setMakerspace] = useState<null|MakerspaceConfig>(null);

    useEffect(() => {
        const getMakerspace = async () => {
            const makerspace = await getCurrentServer();
            setMakerspace(makerspace);
            if (makerspace){
                GLOBAL.serverName = makerspace.name;
            }
        };
        getMakerspace();
    }, []);
    return makerspace;
};