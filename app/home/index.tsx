import { QrCode } from '@tamagui/lucide-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { useSelector } from 'react-redux';
import { Button, H2, ScrollView, YStack } from 'tamagui';
import BlurHeader from '../../components/BlurHeader';
import { LargeBentoBox } from '../../components/LargeBentoBox';
import { useColors } from '../../constants/Colors';
import { useLocation } from '../../hooks/useLocation';
import { fetchLocationGroups, fetchMachineGroups, fetchMachines, selectActiveMachinesForUserFactory, selectLoading, selectMachineGroups } from '../../state/slices/machinesSlice';
import { currentServerSelector } from '../../state/slices/makerspacesSlice';
import { useAppDispatch } from '../../state/store';
export default function Make() {
    const colors = useColors();
    const machineGroupMap = useSelector(selectMachineGroups);
    const makerspace = useSelector(currentServerSelector);
    const { locationMap, location } = useLocation();
    const activeMachines = useSelector(selectActiveMachinesForUserFactory(makerspace));
    const loading = useSelector(selectLoading);
    const dispatch = useAppDispatch();

    const handleRefresh = () => {
        if (makerspace){
            dispatch(fetchMachines(makerspace));
            dispatch(fetchMachineGroups(makerspace));
            dispatch(fetchLocationGroups(makerspace));
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
            <BlurHeader title="MakerPass" subtitle={'@' + location?.name} isHero pullToRefresh={handleRefresh} refreshing={loading}>
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