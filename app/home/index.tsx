import { QrCode } from '@tamagui/lucide-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { Button, getTokens, H2, H3, ScrollView, YStack } from 'tamagui';
import BlurHeader from '../../components/BlurHeader';
import { LargeBentoBox } from '../../components/LargeBentoBox';
import { useColors } from '../../constants/Colors';
import { fetchLocationGroups, fetchMachineGroups, fetchMachines, selectActiveMachinesForUserFactory, selectCurrentLocationGroup, selectLoading, selectLocationGroups, selectMachineGroups } from '../../state/slices/machinesSlice';
import { addOrUpdateServer, currentServerSelector } from '../../state/slices/makerspacesSlice';
import { useAppDispatch } from '../../state/store';
import { Color } from '../../types/makerspaceServer';
export default function Make() {
    const colors = useColors();
    const machineGroupMap = useSelector(selectMachineGroups);
    const makerspace = useSelector(currentServerSelector);
    const activeMachines = useSelector(selectActiveMachinesForUserFactory(makerspace));
    const locationGroup = useSelector(selectCurrentLocationGroup);
    const loading = useSelector(selectLoading);
    const dispatch = useAppDispatch();

    const [locationPickerActivated, setLocationPickerActivated] = useState(false);

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

            <BlurHeader title="MakerPass" subtitle={'@' + locationGroup?.name} isHero pullToRefresh={handleRefresh} subtitleOnPress={() => {setLocationPickerActivated(!locationPickerActivated);}} refreshing={loading}>
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
                        marginLeft={'$2'}
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
            <LocationSwitcher active={locationPickerActivated} dismiss={() => setLocationPickerActivated(!locationPickerActivated)} />
        </>
    );

}

const LocationSwitcher = ({ active, dismiss }: { active: boolean, dismiss: () => void }) => {
    const makerspace = useSelector(currentServerSelector);
    const locations = useSelector(selectLocationGroups);
    const dispatch = useAppDispatch();
    const colors = useColors();
    const opacity = useSharedValue(0);
    const backgroundOpacity = useSharedValue(0);
    useEffect(() => {
        if (active){
            opacity.value = withTiming(1, { duration: 300 }, () => {});
            backgroundOpacity.value = withTiming(.94, { duration: 300 }, () => {});
        } else {
            opacity.value = withTiming(0, { duration: 300 }, () => {});
            backgroundOpacity.value = withTiming(0, { duration: 300 }, () => {});
        }
    }, [active]);
    const changeLocation = (locationId:string) => {
        if (makerspace){
            dispatch(addOrUpdateServer({ ...makerspace, currentLocation: locationId }));
        }
    };

    // when location switcher is activated, animate opacity of background over 1 second

    return (
        <>
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: getTokens().color[colors.background as Color].val,
                    //opacity is animated'
                    opacity:backgroundOpacity,
                }}
                pointerEvents={active ? 'auto' : 'none'}

            />
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'transparent',
                    opacity,
                }}
                pointerEvents={active ? 'auto' : 'none'}
            >
                <BlurHeader title="Change Location" isTransparent isHero={false} refreshing={false} >
                    <YStack
                        height={'100%'}
                        onPress={() => {dismiss();}}
                        paddingLeft={'$2'}
                    >
                        {Object.keys(locations).map((locationId) => {
                            const location = locations[locationId];
                            return (
                                <H3
                                    key={locationId}
                                    marginLeft={'$2'}
                                    marginBottom={'$1'}
                                    color={colors.text}
                                    onPress={() => {changeLocation(locationId); dismiss();}}
                                    opacity={.7}
                                    borderRadius={10}

                                >{'@' + location.name}</H3>
                            );
                        })}
                    </YStack>
                </BlurHeader>
            </Animated.View>
        </>
    );
};