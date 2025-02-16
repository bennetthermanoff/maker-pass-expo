import { QrCode } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { Button, getTokens, H2, H3, ScrollView, Text, YStack } from 'tamagui';
import BlurHeader from '../../components/BlurHeader';
import { GridMachineBentoBox } from '../../components/GridMachineBentoBox';
import { LargeMachineBentoBox } from '../../components/LargeMachineBentoBox';
import { Colors } from '../../constants/Colors';
import { fetchLocationGroups, fetchMachineGroups, fetchMachines, selectActiveMachinesForUserFactory, selectCurrentLocationGroup, selectFlatYourMachinesForUser, selectLoading, selectLocationGroups, selectMachines, selectMachinesForCatalog, selectYourMachinesForUser } from '../../state/slices/machinesSlice';
import { addOrUpdateServer, colorSelector, currentServerSelector } from '../../state/slices/makerspacesSlice';
import { fetchPermissionGroups, fetchPermissionsForUser } from '../../state/slices/permissionsSlice';
import { useAppDispatch } from '../../state/store';
import { Machine, MachineGroupMap, PermissionGroupMap } from '../../types/machine';
import { Color } from '../../types/makerspaceServer';
export default function Make() {
    const colors = useSelector(colorSelector);
    const makerspace = useSelector(currentServerSelector);
    const loading = useSelector(selectLoading);
    const dispatch = useAppDispatch();

    const machines = useSelector(selectMachines);
    const yourMachinesForUser = useSelector(selectYourMachinesForUser);
    const activeMachines = useSelector(selectActiveMachinesForUserFactory(makerspace));
    const flatYourMachinesForUser = useSelector(selectFlatYourMachinesForUser);

    const locationGroup = useSelector(selectCurrentLocationGroup);
    const [locationPickerActivated, setLocationPickerActivated] = useState(false);

    const handleRefresh = debounce(() => {
        if (makerspace){
            dispatch(fetchMachines(makerspace));
            dispatch(fetchMachineGroups(makerspace));
            dispatch(fetchLocationGroups(makerspace));
            dispatch(fetchPermissionGroups(makerspace));
            dispatch(fetchPermissionsForUser(makerspace));
        }
    }, 3000, { leading: true, trailing: false });

    useEffect(() => {
        AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                handleRefresh();
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (machines.length === 0 && !loading){
            //catches edge cases where the user wasn't logged in when we get to the home screen (usually first fetch happens during splashscreen)
            handleRefresh();
        }
    },[]);
    return (
        <>
            <BlurHeader title="MakerPass" subtitle={'@' + locationGroup?.name} isHero pullToRefresh={handleRefresh} subtitleOnPress={() => {setLocationPickerActivated(!locationPickerActivated);}} refreshing={loading}>
                <ActiveMachineBento colors={colors} activeMachines={activeMachines} />
                {flatYourMachinesForUser.length > 0 && <YourMachinesBento colors={colors} machineMap={yourMachinesForUser.machinesByGroupId} permissionGroupMap={yourMachinesForUser.permissionGroupMap} />}
                <CatalogBento colors={colors} catalog={useSelector(selectMachinesForCatalog)} />
                <YStack
                    paddingBottom={150}
                />
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
                    // fontSize={'$7'}
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

const ActiveMachineBento = ({ colors, activeMachines }: { colors: Colors, activeMachines: Machine[] }) =>
    <YStack
        aspectRatio={2} //Important!
        alignSelf='center'
        margin={'$3'}
        marginBottom={'$1'}
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
        {activeMachines.length === 0 ?
            <YStack
                height={'100%'}
                justifyContent='center'
            >
                <H3
                    marginTop={-60.7}
                    textAlign='center'
                    alignSelf='center'
                    color={colors.text}
                >No Active Machines</H3>
                <Text
                    textAlign='center'
                    alignSelf='center'
                    color={colors.text}
                >Scan a QR Code to start a machine</Text>
            </YStack>
            :
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                showsVerticalScrollIndicator={false}
                width={'100%'}
            >
                {activeMachines.map((machine, index) =>
                    <LargeMachineBentoBox
                        key={machine.id}
                        machine={machine}
                        colors={colors}
                        showDisableButton={true}
                    />)}
            </ScrollView>
        }
    </YStack>;

const YourMachinesBento = ({ colors, machineMap, permissionGroupMap }: { colors: Colors, machineMap: Record<string, Machine[]>, permissionGroupMap:PermissionGroupMap}) =>
    <YStack
        aspectRatio={1.6} //Important!
        alignSelf='center'
        margin={'$3'}
        width={'95%'}
        padding={'$3'}
        paddingTop={'$1'}
        marginBottom={'$1'}
        paddingBottom={'$0'}

        backgroundColor={colors.accent.light}
        borderRadius={20}
    >
        <H2
            marginLeft={'$2'}
            marginBottom={'$1'}
            color={colors.text}
        >Your Machines</H2>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            showsVerticalScrollIndicator={false}
            width={'100%'}
        >
            {Object.keys(machineMap).map((groupId) =>
                (machineMap[groupId].length > 0 ?
                    <GridMachineBentoBox
                        key={groupId}
                        colors={colors}
                        machines={machineMap[groupId]}
                        groupName={groupId !== 'OTHER' ? permissionGroupMap[groupId]?.name : 'Other'}
                    />
                    :
                    <></>))}
        </ScrollView>
    </YStack>;

const LocationSwitcher = ({ active, dismiss }: { active: boolean, dismiss: () => void }) => {
    const makerspace = useSelector(currentServerSelector);
    const locations = useSelector(selectLocationGroups);
    const dispatch = useAppDispatch();
    const colors = useSelector(colorSelector);
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

const CatalogBento = ({ colors, catalog }:{colors:Colors, catalog:{ machineMapByGroupIds:Record<string,Machine[]>, machineGroups: MachineGroupMap}}) =>
    <YStack
        aspectRatio={1.6} //Important!
        alignSelf='center'
        margin={'$3'}
        width={'95%'}
        padding={'$3'}
        paddingTop={'$1'}
        marginBottom={'$1'}
        paddingBottom={'$0'}

        backgroundColor={colors.accent.light}
        borderRadius={20}
    >
        <H2
            marginLeft={'$2'}
            marginBottom={'$1'}
            color={colors.text}
        >Catalog</H2>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            showsVerticalScrollIndicator={false}
            width={'100%'}
        >
            {Object.keys(catalog.machineMapByGroupIds).map((groupId) =>
                <GridMachineBentoBox
                    key={groupId}
                    colors={colors}
                    machines={catalog.machineMapByGroupIds[groupId]}
                    groupName={catalog.machineGroups[groupId]?.name}
                />)}
        </ScrollView>
    </YStack>;