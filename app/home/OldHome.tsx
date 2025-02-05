import { Button, Card, Paragraph, Image, XStack, H2, CardProps, YStack, Circle, Spacer } from 'tamagui';
import { AlertOctagon, AlertTriangle, Clock10 } from '@tamagui/lucide-icons';
import  BlurHeader  from '../../components/BlurHeader';
import { useColors, Colors } from '../../constants/Colors';
import { useMakerspace } from '../../hooks/useMakerspace';
import { router, useFocusEffect } from 'expo-router';
import { Machine } from '../../types/machine';
import { LinearGradient } from '@tamagui/linear-gradient';
import { QrCode } from '@tamagui/lucide-icons';
import React, { useCallback, useEffect, useState } from 'react';
import defaultImage from '../../assets/images/icon.png';
import { AppState, ImageSourcePropType } from 'react-native';
import PagerView from 'react-native-pager-view';
import * as Haptics from 'expo-haptics';
import { omit } from 'lodash';
import { useSelector } from 'react-redux';
import { disableMachine, fetchMachineGroups, fetchMachines, selectLoading, selectMachineGroups, selectMachines } from '../../state/slices/machinesSlice';
import { useAppDispatch } from '../../state/store';
export type Page = {
    name:string;
    machines:Array<Machine & { lastUsedByName:string|null }>;
    type:'group'|'user'|'taggedOut'|'inUse';
};
export default function Machines() {
    const colors = useColors();
    const [pages, setPages] = useState<Page[]>([{ name:'Machines', type:'group', machines:[] }]);
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

    // Machine Pages
    // (if any) Machines that are enabled by current user
    // (if admin or technician) Machines that are enabled by other users
    // (if admin or technician) machines that are tagged out
    // MAP(machine groups) -> Machines
    // ungrouped machines
    useEffect(() => {
        if (machineGroupMap && machines){
            const pages:Page[] = [];
            const machineGroups = Object.keys(machineGroupMap);
            const groupedMachineIds:string[] = [];
            if (machines.filter((machine) => machine.enabled && machine.lastUsedBy === makerspace?.user?.userId).length > 0){
                pages.push({ type:'user', name:'Your Machines', machines:machines.filter((machine) => machine.enabled && machine.lastUsedBy === makerspace?.user?.userId) });
            }
            if (makerspace?.user?.userType === 'admin' || makerspace?.user?.userType === 'technician'){
                if (machines.filter((machine) => machine.enabled && machine.lastUsedBy !== makerspace?.user?.userId).length > 0){
                    pages.push({ name:'In Use', type:'inUse', machines:machines.filter((machine) => machine.enabled && machine.lastUsedBy !== makerspace?.user?.userId) });
                }
                if (machines.filter((machine) => machine.latestTagOutId).length > 0){
                    pages.push({ name:'Tagged Out', type:'taggedOut', machines:machines.filter((machine) => machine.latestTagOutId) });
                }
            }
            machineGroups.forEach((machineGroup) => {
                const foundMachines = machineGroupMap[machineGroup].machineIds.map((machineId) => {
                    groupedMachineIds.push(machineId);
                    return machines.find((machine) => machine.id === machineId);
                })
                    .filter((machine) => machine !== undefined) as Array<Machine & { lastUsedByName:string|null }>;
                pages.push({ name:machineGroupMap[machineGroup].name, type:'group', machines:foundMachines });
            });
            if (machines.length > groupedMachineIds.length){
                pages.push({ name:'Ungrouped', type:'group', machines:machines.filter((machine) => !groupedMachineIds.includes(machine.id)) });
            }

            if (pages.length === 0){
                pages.push({ name:'', type:'group', machines:[] });
            }
            //verify no machines are undefined
            setPages(pages);
        }
    }, [machineGroupMap, machines, makerspace]);

    return (
        <>
            <PagerView
                style={{ flex:1 }}
                onPageSelected={(event) => {setCurrentPage(event.nativeEvent.position);}}
            >
                {pages.map((page, index) =>
                    <BlurHeader key={index} title={page.name} pullToRefresh={handleRefresh} refreshing={loading}>

                        {page.machines.map((machine) => <MachineCard
                            machine={machine}
                            colors={colors}
                            disableMachine={makerspace ? (machineId) => dispatch(disableMachine({ machineId:machine.id, makerspace })) : () => {}}
                            canDisable={
                                machine.enabled && (makerspace?.user?.userType === 'admin' ||
                                makerspace?.user?.userType === 'technician' ||
                                machine.lastUsedBy === makerspace?.user?.userId)}
                            key={index + machine.id}
                            cardProps={
                                { onLongPress:() => {
                                    if (makerspace?.user?.userType === 'admin' || makerspace?.user?.userType === 'technician'){
                                        Haptics.selectionAsync();
                                        router.push({ pathname: '/tagoutMachine/[machineId]', params: { machineId:machine.id, machine:JSON.stringify(omit(machine, ['photo'])) } });
                                    }
                                },
                                }}
                        />)}
                    </BlurHeader>)}
            </PagerView>

            <YStack
                position='absolute'
                bottom={0}
                right={0}
                width={'100%'}
                backgroundColor={'transparent'}
            >
                {machines.length > 0 &&
                <Button
                    color={colors.text}
                    iconAfter={QrCode}
                    margin={'$3'}
                    marginBottom={'$-3'}
                    scaleIcon={2}
                    alignSelf='flex-end'
                    fontSize={'$7'}
                    backgroundColor={colors.accent.dark}
                    onPress={() => {
                        router.push('/scanner');
                    }}
                >Scan QR</Button>}

                <XStack
                    minWidth={'$4'}
                    height={'$1'}
                    backgroundColor={colors.inverseText}
                    borderRadius={'$5'}
                    justifyContent="center"
                    alignSelf="center"
                    marginTop={'$-5'}
                    margin={'$4'}
                    padding={'$1'}
                >
                    {pages.map((page, index) => {
                        if (page.type === 'group'){
                            return <Circle
                                key={index}
                                backgroundColor={index === currentPage ? colors.secondaryAccent.dark : 'grey'}
                                size={10}
                                alignSelf="center"
                                margin={'$1'}
                            />;
                        }
                        if (page.type === 'user'){
                            return <Clock10
                                key={index}
                                color={index === currentPage ? colors.text : 'grey'}
                                size={11}
                                style={{ alignSelf:'center',margin:1.5 }}
                                strokeWidth={3.5}
                            />;
                        }
                        if (page.type === 'inUse'){
                            return <AlertTriangle
                                key={index}
                                color={index === currentPage ? 'yellow' : 'grey'}
                                size={11}
                                style={{ alignSelf:'center',margin:1.5 }}
                                strokeWidth={3.5}
                            />;
                        }
                        if (page.type === 'taggedOut'){
                            return <AlertOctagon
                                key={index}
                                color={index === currentPage ? 'red' : 'grey'}
                                size={11}
                                style={{ alignSelf:'center',margin:1.5 }}
                                strokeWidth={3.5}
                            />;
                        }
                    })

                    }

                </XStack>

            </YStack>
        </>
    );
}

export const MachineCard = (props: {machine:Machine, uri?:string, cardProps?:CardProps, colors:Colors, canDisable:boolean, disableMachine:(machineId:string)=>void }) => {
    const [animateTime,setAnimateTime] = useState(0);

    useEffect(() => {
        const DELAY = 1000 / 60; //60fps
        const timeIncrement = async () => {
            await new Promise((res) => setTimeout(res,DELAY));
            if (animateTime <= 1000){
                setAnimateTime(animateTime + DELAY);
            } else {
                setAnimateTime(0);
            }

        };
        // timeIncrement();

    },[animateTime]);

    const handleEnableButton = () => {
        if (props.machine.enabled){
            //disable machine
            props.disableMachine(props.machine.id);
        } else {
            //enable machine
            router.push('/scanner/');
        }

    };

    const getSubtext = () => {
        const out:{statusLightColor?:string, topLine?:string, bottomLine?:string } = {};
        if (props.machine.enabled){
            out.statusLightColor = '$green8';
            out.topLine = 'Active';
            out.bottomLine = `Enabled By ${props.machine.lastUsedByName}`;
        }
        else {
            out.statusLightColor = '$red4';
            out.topLine = 'Inactive';
            out.bottomLine = ' ';
        }
        if (props.machine.latestTagOutId){
            out.statusLightColor = '$red8';
            out.topLine = 'Tagged Out';
            // out.bottomLine = props.machine.latestTagOutId;
            //
        }
        return out;
    };

    return (
        <YStack
            margin={'$2'}
        >
            <Card
                elevate
                size="$4"
                borderColor={props.colors.inverseText}

                {...props.cardProps}
            >
                <Card.Header zIndex={2} padded>
                    <H2 color={props.colors.text}>{props.machine.name}</H2>
                    <XStack marginLeft={4}>
                        <Circle
                            size={18}
                            transform={[{ translateY: -4.5 }, { translateX: -3 }]}
                            backgroundColor={getSubtext().statusLightColor}
                        />
                        <YStack>
                            <Paragraph fontWeight={700} fontSize={15} marginTop={-7} marginBottom={-3} color={props.colors.text}>{getSubtext().topLine}</Paragraph>
                            <Paragraph marginBottom={'$-4'} marginLeft={'$-4'} color={props.colors.subText}>{getSubtext().bottomLine}</Paragraph>
                        </YStack>

                    </XStack>

                </Card.Header>
                <Card.Footer padded>
                    <XStack flex={1} />
                    {props.canDisable ?
                        <Button
                            backgroundColor={'$red8'}
                            borderRadius="$10"
                            onPress={handleEnableButton}
                        >{'Disable'}
                        </Button>
                        :
                        <Spacer
                            size={44}
                            padding={0}
                        />
                    }
                </Card.Footer>
                <Card.Background zIndex={1}>
                    <YStack
                        borderRadius={'$5'}
                    >
                        <LinearGradient
                            width={'100%'}
                            borderRadius={7}
                            colors={props.colors.text === 'black' ? ['#ffffffff', '#ffffff00'] : ['#000000ff', '#00000000']}
                            opacity={1}
                            style={{ position:'absolute', height:'100%' }}
                        />
                        <Image
                            resizeMode="cover"
                            alignSelf="center"
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: 7,
                            }}
                            zIndex={-1}
                            source={props.machine.photo ? { uri:'data:image/png;base64,' + props.machine.photo  } : defaultImage as ImageSourcePropType}
                        />

                    </YStack>

                </Card.Background>
            </Card>
        </YStack>);
};