import { useEffect, useState } from 'react';
import { MakerspaceConfig } from '../types/makerspaceServer';
import { getCurrentServer } from './makerspaces';

export const useMakerspace = () => {
    const [makerspace, setMakerspace] = useState<null|MakerspaceConfig>(null);

    useEffect(() => {
        const getMakerspace = async () => {
            const makerspace = await getCurrentServer();
            setMakerspace(makerspace);
        };
        getMakerspace();
    }, []);
    return makerspace;
};