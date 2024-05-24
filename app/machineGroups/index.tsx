import { Button, H2, Spacer, Text, YStack } from 'tamagui';
import BlurHeader from '../../components/BlurHeader';
import { Colors, useColors } from '../../constants/Colors';
import { useMachineGroups } from '../../hooks/useMachineGroups';
import { Machine, MachineGroupArray, MachineGroupBody } from '../../types/machine';
import { LinearGradient } from '@tamagui/linear-gradient';
import { router } from 'expo-router';
import { Plus } from '@tamagui/lucide-icons';
import { CancelButton } from '../../components/CancelButton';
import { ViewProps } from '../../components/Themed';
import { parseGroupName } from '../../util/parseGroupName';

export default function ManageMachineGroups(){
    const { machineGroups, loading, error, debouncedGetMachineGroups, machines } = useMachineGroups();
    const colors = useColors();

    return (
        <>
            <BlurHeader title="Machine Groups" pullToRefresh={debouncedGetMachineGroups} refreshing={loading}>
                <Button
                    iconAfter={Plus}
                    scaleIcon={1.5}
                    fontSize={'$5'}
                    textAlign="left"
                    color={colors.text}
                    backgroundColor={colors.accent.dark}
                    width={140}
                    alignSelf='flex-end'
                    margin={'$4'}
                    marginBottom={'$-2'}
                    onPress={() => {
                        router.push({ pathname: '/machineGroups/new', params: {} });
                    }}
                >Group</Button>
                {machineGroups?.map((machineGroup) => <MachineGroupCard
                    key={machineGroup.id}
                    childProps={{ key:machineGroup.id,
                        onLongPress:() => router.push({ pathname: `/machineGroups/${machineGroup.id}`, params: { machineGroup:JSON.stringify(machineGroup) } }) }}
                    machineGroup={machineGroup}
                    colors={colors}
                    machines={machines}
                />)}
                <Spacer size={'$12'} />

            </BlurHeader>
            <CancelButton colors={colors} />

        </>
    );

}

const MachineGroupCard = (props:{machineGroup:MachineGroupBody & {id:string},colors:Colors, machines:Machine[], childProps:any}) =>
    <YStack
        marginTop={'$4'}
        minHeight={150}
        width="95%"
        backgroundColor={props.colors.secondaryAccent.light}
        borderRadius={7}
        alignSelf='center'
        key={props.machineGroup.id}
        {...props.childProps}
    >
        <LinearGradient
            width={'100%'}
            borderRadius={7}
            height={150}
            marginBottom={-150}
            zIndex={0}
            colors={props.colors.text === 'black' ? ['#ffffff', '#ffffff00'] : ['#000000', '#00000000']}
            opacity={.85}
        />
        <H2
            marginTop={'$2'}
            marginLeft={'$2'}
            color={props.colors.text}
        >{parseGroupName(props.machineGroup.name)[0]}</H2>
        {parseGroupName(props.machineGroup.name)[1] && <Text
            color={props.colors.text}
            opacity={.8}
            marginTop={'$-2'}
            marginLeft={'$2'}
        >{`@${parseGroupName(props.machineGroup.name)[1]}`}</Text>}
        {props.machineGroup.machineIds.map((machineId,index) => <>
            {index < 3 && <Text
                color={props.colors.subText}
                key={machineId}
                fontSize={'$7'}
                margin={'$1'}
                marginLeft={'$3'}
            >{props.machines.find((machine) => machine.id === machineId)?.name || 'Unknown Machine'} </Text>
            }
        </>)}
        {props.machineGroup.machineIds.length >= 3 && <Text
            color={props.colors.subText}
            fontSize={'$9'}
            marginLeft={'$3.5'}
            marginTop={'$-4.5'}
            marginBottom={'$2'}
            key={'...'}
        >...</Text>
        }

    </YStack>;
