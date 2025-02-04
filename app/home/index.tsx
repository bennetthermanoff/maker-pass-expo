import { useColors } from '../../constants/Colors';
import BlurHeader from '../../components/BlurHeader';
import { Text, YStack, Image } from 'tamagui';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchMachineGroups, fetchMachines, selectLoading, selectMachineGroups, selectMachines } from '../../state/slices/machinesSlice';
import Banner from '../../assets/images/banner.png';
import BannerDark from '../../assets/images/banner-dark.png';
import { useMakerspace } from '../../hooks/useMakerspace';
import { useAppDispatch } from '../../state/store';
import { useFocusEffect } from 'expo-router';
import { AppState, ImageSourcePropType } from 'react-native';
export default function Make() {
    const colors = useColors();
    const [currentPage, setCurrentPage] = useState(0);
    const machineGroupMap = useSelector(selectMachineGroups);
    const machines = useSelector(selectMachines);
    const makerspace = useMakerspace();
    const loading = useSelector(selectLoading);
    const dispatch = useAppDispatch();

    const handleRefresh = () => {
        if (makerspace){
            dispatch(fetchMachines(makerspace));
            dispatch(fetchMachineGroups(makerspace));
        }
    };
    useFocusEffect(useCallback(() => {
        handleRefresh();
    }, []));
    useEffect(() => {
        AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                handleRefresh();
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(handleRefresh,[makerspace, dispatch]);
    return (
        <>
            <BlurHeader title="" pullToRefresh={handleRefresh} refreshing={loading}>
                <YStack alignItems='center' height={'$20'} margin={'$3'} borderRadius={'$3'} >
                    <YStack style={{ height: '100%', width: '100%', position: 'absolute', top: 0, right: 0 }} backgroundColor={colors.inverseText} borderRadius={'$3'} opacity={.3} />
                    <Image
                        marginTop={'$3'}
                        source={(colors.text === 'white' ? BannerDark : Banner) as ImageSourcePropType}
                        resizeMode='contain'
                        width={'90%'}
                        height={'30%'}
                    />
                    <Text fontSize={'$6'} color={colors.text} marginTop={'$2'}>Scan a QR to activate a machine!</Text>
                </YStack>
            </BlurHeader>
        </>
    );

}