import { LinearGradient } from '@tamagui/linear-gradient';
import { Plus } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { Button, H2, Spacer, Text, YStack } from 'tamagui';
import BlurHeader from '../../components/BlurHeader';
import { Colors, useColors } from '../../constants/Colors';
import { fetchLocationGroups, selectLoading, selectLocationGroupsAsArray, selectMachineGroupAsArray } from '../../state/slices/machinesSlice';
import { currentServerSelector } from '../../state/slices/makerspacesSlice';
import { useAppDispatch } from '../../state/store';
import { LocationGroupBody, MachineGroupArray } from '../../types/machine';
import { parseGroupName } from '../../util/parseGroupName';

export default function ManageLocationGroups(){
    const locationGroups = useSelector(selectLocationGroupsAsArray);
    const machineGroups = useSelector(selectMachineGroupAsArray);
    const loading = useSelector(selectLoading);
    const makerspace = useSelector(currentServerSelector);
    const dispatch = useAppDispatch();
    const colors = useColors();
    const getLocationGroups = async () => {
        if (makerspace?.user){
            dispatch(fetchLocationGroups(makerspace));
        }
    };

    return (
        <>
            <BlurHeader title="Location Groups" hasBackButton pullToRefresh={getLocationGroups} refreshing={loading}>
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
                        router.push({ pathname: '/locationGroups/[groupId]', params: { groupId:'new' } });
                    }}
                >Group</Button>
                {locationGroups?.map((locationgroup) => <LocationgroupCard
                    key={locationgroup.id}
                    childProps={{ key:locationgroup.id,
                        onLongPress:() => router.push({ pathname: '/locationGroups/[groupId]', params: { groupId:locationgroup.id } }) }}
                    locationGroup={locationgroup}
                    colors={colors}
                    machineGroups={machineGroups}
                />)}
                <Spacer size={'$12'} />

            </BlurHeader>
        </>
    );

}

const LocationgroupCard = (props:{locationGroup:LocationGroupBody & {id:string},colors:Colors, machineGroups:MachineGroupArray, childProps:any}) =>
    <YStack
        marginTop={'$4'}
        minHeight={150}
        width="95%"
        backgroundColor={props.colors.secondaryAccent.light}
        borderRadius={7}
        alignSelf='center'
        key={props.locationGroup.id}
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
        >{parseGroupName(props.locationGroup.name)[0]}</H2>
        {parseGroupName(props.locationGroup.name)[1] && <Text
            color={props.colors.text}
            opacity={.8}
            marginTop={'$-2'}
            marginLeft={'$2'}
        >{`@${parseGroupName(props.locationGroup.name)[1]}`}</Text>}
        {props.locationGroup.groups.map((groupId,index) => <>
            {index < 3 && <Text
                color={props.colors.subText}
                key={groupId}
                fontSize={'$7'}
                margin={'$1'}
                marginLeft={'$3'}
            >{props.machineGroups.find((machineGroup) => machineGroup.id === groupId)?.name || 'unknown group'}</Text>
            }
        </>)}
        {props.locationGroup.groups.length >= 3 && <Text
            color={props.colors.subText}
            fontSize={'$9'}
            marginLeft={'$3.5'}
            marginTop={'$-4.5'}
            marginBottom={'$2'}
            key={'...'}
        >...</Text>
        }

    </YStack>;
