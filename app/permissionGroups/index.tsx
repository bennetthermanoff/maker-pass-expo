import { Button, H2, Spacer, Text, YStack } from 'tamagui';
import BlurHeader from '../../components/BlurHeader';
import { Colors, useColors } from '../../constants/Colors';
import { useMachineGroups } from '../../hooks/useMachineGroups';
import { Machine, MachineGroupArray, MachineGroupBody, PermissionGroup } from '../../types/machine';
import { LinearGradient } from '@tamagui/linear-gradient';
import { router } from 'expo-router';
import { Plus } from '@tamagui/lucide-icons';
import { ViewProps } from '../../components/Themed';
import { usePermissionGroups } from '../../hooks/usePermissionGroups';

export default function ManageMachineGroups(){
    const colors = useColors();
    const { permissionGroups, loading, error, debouncedGetPermissionGroups, machines } = usePermissionGroups();
    return (
        <>
            <BlurHeader hasBackButton title="Permisison Groups" pullToRefresh={debouncedGetPermissionGroups} refreshing={loading}>
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
                        router.push({ pathname: '/permissionGroups/[groupId]', params: { groupId:'new' } });
                    }}
                >Group</Button>
                {permissionGroups?.map((permissionGroup) => <PermissionGroupCard
                    key={permissionGroup.id}
                    childProps={{ key:permissionGroup.id,
                        onLongPress:() => router.push({ pathname: '/permissionGroups/[groupId]', params: { groupId:permissionGroup.id, permissionGroup:JSON.stringify(permissionGroup),
                        } }) }}
                    permissionGroup={permissionGroup}
                    colors={colors}
                    machines={machines}
                />)}
                <Spacer size={'$12'} />

            </BlurHeader>

        </>
    );

}

const PermissionGroupCard = (props:{permissionGroup:PermissionGroup & {id:string},colors:Colors, machines:Machine[], childProps:any}) =>
    <YStack
        marginTop={'$4'}
        minHeight={150}
        width="95%"
        backgroundColor={props.colors.secondaryAccent.light}
        borderRadius={7}
        alignSelf='center'
        key={props.permissionGroup.id}
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
        >{props.permissionGroup.name}</H2>
        {props.permissionGroup.machineIds.map((machineId,index) => <>
            {index < 3 && <Text
                color={props.colors.subText}
                key={machineId}
                fontSize={'$7'}
                margin={'$1'}
                marginLeft={'$3'}
            >{props.machines.find((machine) => machine.id === machineId)?.name || 'Unknown Machine'} </Text>
            }
        </>)}
        {props.permissionGroup.machineIds.length >= 3 && <Text
            color={props.colors.subText}
            fontSize={'$9'}
            marginLeft={'$3.5'}
            marginTop={'$-4.5'}
            marginBottom={'$2'}
            key={'...'}
        >...</Text>
        }

    </YStack>;
