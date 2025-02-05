import { useColors } from '../../constants/Colors';
import BlurHeader from '../../components/BlurHeader';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchMachineGroups, fetchMachines, selectActiveMachinesForUserFactory, selectLoading, selectMachineGroups, selectMachines } from '../../state/slices/machinesSlice';
import { useMakerspace } from '../../hooks/useMakerspace';
import { useAppDispatch } from '../../state/store';
import { router, useFocusEffect } from 'expo-router';
import { AppState } from 'react-native';
import { Button, H2, ScrollView, YStack } from 'tamagui';
import { QrCode } from '@tamagui/lucide-icons';
import { MachineCard } from './OldHome';
import { LargeBentoBox } from '../../components/LargeBentoBox';
import { getImage } from '../../util/machineImageCache';
export default function Make() {
    const colors = useColors();
    const [currentPage, setCurrentPage] = useState(0);
    const machineGroupMap = useSelector(selectMachineGroups);
    const makerspace = useMakerspace();
    const activeMachines = useSelector(selectActiveMachinesForUserFactory(makerspace));
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
            <BlurHeader title="MakerPass" subtitle='@Tulane MakerSpace' isHero pullToRefresh={handleRefresh} refreshing={loading}>
                <YStack
                    aspectRatio={1.9} //Important!

                    alignSelf='center'
                    margin={'$3'}
                    width={'95%'}
                    padding={'$3'}
                    backgroundColor={colors.accent.light}
                    borderRadius={20}
                >
                    <H2
                        marginLeft={'$3'}
                        marginBottom={'$1'}
                        color={colors.text}
                    >Active Machines</H2>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        showsVerticalScrollIndicator={false}
                        width={'100%'}
                    >
                        {activeMachines.map((machine, index) =>
                            <LargeBentoBox
                                key={machine.id}
                                machine={machine}
                                colors={colors}
                                showDisableButton={true}
                            />)}
                    </ScrollView>

                </YStack>

            </BlurHeader>
            <YStack
                position='absolute'
                bottom={0}
                right={0}
                width={'100%'}
                backgroundColor={'transparent'}
            >
                <Button
                    color={colors.text}
                    iconAfter={QrCode}
                    margin={'$3'}
                    marginBottom={'$3'}
                    width={'95%'}
                    height={60}
                    scaleIcon={2}
                    alignSelf='center'
                    fontSize={'$7'}
                    backgroundColor={colors.accent.dark}
                    onPress={() => {
                        router.push('/scanner');
                    }}
                >Scan QR</Button>
            </YStack>

        </>
    );

}