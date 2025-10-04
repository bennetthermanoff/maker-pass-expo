import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Spinner, Text, View, XStack, YStack } from 'tamagui';
import BlurHeader from '../../../components/BlurHeader';
import { Colors } from '../../../constants/Colors';
import { selectMachines } from '../../../state/slices/machinesSlice';
import { colorSelector, currentServerSelector } from '../../../state/slices/makerspacesSlice';
import { Machine } from '../../../types/machine';
import { getAuthHeaders } from '../../../util/authRoutes';

type Blame = {
    id: string;
    type: string | null;
    userId: string | null;
    createdAt: string;
    user: {
        name: string;
    } | null;
}

export default function BlameMachine(){

    const local = useLocalSearchParams();
    const colors = useSelector(colorSelector);
    const makerspace = useSelector(currentServerSelector);
    const machinesFromState = useSelector(selectMachines);

    const getMachineInitialData = () => {
        const machine = machinesFromState.find((machine) => machine.id === local.machineId);
        return machine as Machine;
    };

    const [machine] = useState<Machine>(getMachineInitialData());
    const [loading, setLoading] = useState<boolean>(false);
    const [blames, setBlames] = useState<Array<Blame>>([]);

    const getBlames = async (limit: number) => {
        try {
            if (makerspace?.serverAddress && makerspace?.serverPort){
                setLoading(true);
                const response = await axios.get(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/machine/blame/${machine.id}?limit=${limit}`, getAuthHeaders(makerspace));
                setLoading(false);
                setBlames(response.data);
                return;
            }
        } catch (e) {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBlames(10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [makerspace]);

    return (
        <>
            <BlurHeader
                hasBackButton
                title={machine.name}
                subtitle="Blame History"
                pullToRefresh={() => getBlames(blames.length)}
                refreshing={false}
            >
                <View style={{ padding:10, paddingTop:20 }}>
                    {blames.map((blame) =>
                        <BlameCard blame={blame} key={blame.id} colors={colors} />)}
                </View>
                {loading ?
                    <Spinner
                        size='large'
                        color={colors.accent.dark}
                        marginTop={'$4'}
                        marginBottom={'$2'}
                    /> :
                    <Button
                        marginBottom={'$8'}
                        alignSelf='center'
                        width={'92%'}
                        color={'black'}
                        backgroundColor={colors.accent.dark}
                        onPress={() => getBlames(blames.length + 10)}
                    >
                        <Text
                            color={'white'}
                            fontWeight='bold'
                            fontSize={16}
                        >Load More</Text>
                    </Button>
                }
            </BlurHeader>
        </>
    );
}

const BlameCard = (props:{blame:Blame, colors:Colors}) =>
    <YStack
        marginBottom={'$2'}
        width={'95%'}
        minHeight={50}
        backgroundColor={props.blame.type?.includes('DISABLE') ? props.colors.secondaryAccent.light : props.colors.accent.light}
        borderRadius={7}
        alignSelf='center'
        borderWidth={1}
        borderColor={props.colors.accent.dark}
        key={props.blame.id}
    >
        <XStack marginTop={'$2'}>
            <Text
                marginLeft={'$2'}
                color={props.colors.text}
                fontWeight="bold"
            >{props.blame.user?.name || 'Unknown User'}</Text>

            <Text
                marginLeft={'auto'}
                marginRight={'$2'}
                color={props.colors.text}
            >{new Date(props.blame.createdAt).toLocaleTimeString()}</Text>
        </XStack>
        <XStack marginTop={'$2'}>
            <Text
                marginLeft={'$2'}
                marginBottom={'$2'}
                color={props.colors.text}
            >{`Action: ${props.blame.type || 'Unknown'}`}</Text>
            <Text
                marginLeft={'auto'}
                marginRight={'$2'}
                color={props.colors.text}
            >{new Date(props.blame.createdAt).toDateString()}</Text>
        </XStack>
    </YStack>;