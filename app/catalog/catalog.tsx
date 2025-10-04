import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { H2, H3, ScrollView, Text, YStack } from 'tamagui';
import BlurHeader from '../../components/BlurHeader';
import { LargeMachineBentoBox } from '../../components/LargeMachineBentoBox';
import { Colors } from '../../constants/Colors';
import { selectMachinesForCatalog, selectYourMachinesForUser } from '../../state/slices/machinesSlice';
import { colorSelector, currentServerSelector } from '../../state/slices/makerspacesSlice';
import { Machine, MachineGroupMap, PermissionGroupMap } from '../../types/machine';

export default function Index() {
    return (
        <Catalog type='catalog' />
    );
}

type MachineWithGroups = {
    machinesByGroupId: { [groupId: string]: Machine[] },
    machineGroupMap: MachineGroupMap|PermissionGroupMap
};

export const Catalog = ({ type } : {type:'catalog'|'yourMachines'}) => {

    const yourMachinesForUser = useSelector(selectYourMachinesForUser);
    const machines = useSelector(selectMachinesForCatalog);
    const [state, setState] = useState<MachineWithGroups>({ machinesByGroupId: {}, machineGroupMap: {} });
    const makerspace = useSelector(currentServerSelector);
    const colors = useSelector(colorSelector);
    useEffect(() => {
        if (type === 'catalog'){
            setState({ machineGroupMap:machines.machineGroups, machinesByGroupId:machines.machineMapByGroupIds });
        } else {
            setState({ machineGroupMap:yourMachinesForUser.permissionGroupMap,machinesByGroupId:yourMachinesForUser.machinesByGroupId });
        }
    }, [machines, yourMachinesForUser, type]);

    return (
        <BlurHeader
            title={type === 'catalog' ? 'Catalog' : 'Your Machines'}
            hasBackButton
            pullToRefresh={() => {}} //TODO
            refreshing={false}
        >
            {
                Object.keys(state.machineGroupMap).map((groupId) =>
                    <MachineGroup
                        key={groupId}
                        groupName={state.machineGroupMap[groupId].name.replace(/\s*\(.*?\)\s*/g, '')}
                        colors={colors}
                        machines={state.machinesByGroupId[groupId]}
                        canEdit={makerspace?.user?.userType !== 'user'}
                    />)
            }
            {state.machinesByGroupId['OTHER'] &&
                <MachineGroup
                    groupName={'Other'}
                    colors={colors}
                    machines={state.machinesByGroupId['OTHER']}
                    canEdit={makerspace?.user?.userType !== 'user'}
                />
            }
        </BlurHeader>

    );

};
// basically same as ActiveMachineBento
const MachineGroup = ({ groupName, colors, machines, canEdit }: { groupName: string, colors:Colors, machines: Machine[], canEdit:boolean }) => {
    if (!machines) return <></>;
    return (
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
                numberOfLines={1}
                ellipsizeMode='tail'
                color={colors.text}
            >{groupName}</H2>
            {machines?.length == 0 ?
                <YStack
                    height={'100%'}
                    justifyContent='center'
                >
                    <H3
                        marginTop={-60.7}
                        textAlign='center'
                        alignSelf='center'
                        color={colors.text}
                    >This Machine Group Is Empty</H3>
                    <Text
                        textAlign='center'
                        alignSelf='center'
                        color={colors.text}
                    >Contact a Makerspace Admin, this isn't right!</Text>
                </YStack>
                :
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    showsVerticalScrollIndicator={false}
                    width={'100%'}
                >
                    {machines?.map((machine, _index) =>
                        <LargeMachineBentoBox
                            key={machine.id}
                            machine={machine}
                            colors={colors}
                            showDisableButton={false}
                            onPress={() => {
                                if (canEdit){
                                    router.push({ pathname:'/tagoutMachine/[machineId]', params:{ machineId:machine.id } });
                                }
                            }}
                        />)}
                </ScrollView>
            }
        </YStack>);
};