import { router, useLocalSearchParams } from 'expo-router';
import { Colors, useColors } from '../../constants/Colors';
import { useMakerspace } from '../../hooks/useMakerspace';
import { Machine, TagOutWithName } from '../../types/machine';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../util/authRoutes';
import BlurHeader from '../../components/BlurHeader';
import { Button, H2, H3, H4, H5, Input, Spinner, Text, View, XStack, YStack } from 'tamagui';
import { LinearGradient } from '@tamagui/linear-gradient';
import { CancelButton } from '../../components/CancelButton';

export default function TagOutMachine(){

    const local = useLocalSearchParams();
    const colors = useColors();
    const makerspace = useMakerspace();
    const getMachineInitialData = () => {
        const machine = JSON.parse(local.machine as string);
        return machine as Machine;
    };
    const [machine, setMachine] = useState<Machine>(getMachineInitialData());
    const [tagOuts, setTagOuts] = useState <Array<TagOutWithName>>([]);
    const [reason, setReason] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const getTagOuts = async (limit:number) => {
        try {
            if (makerspace?.serverAddress && makerspace?.serverPort){
                setLoading(true);
                const response = await axios.get(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/tagOut/${machine.id}?limit=${limit}`, getAuthHeaders(makerspace));
                setLoading(false);
                setTagOuts(response.data);
                return;
            }
        } catch (error) {
            alert(error);
            setLoading(false);
        }
    };

    const getMoreTagOuts = async () => {
        const limit = tagOuts.length + 10;
        await getTagOuts(limit);
    };

    const handleSubmitTagOutAndIn = async () => {
        if (!reason){
            return alert('Please enter a reason');
        }
        try {
            if (makerspace){
                if (machine.latestTagOutId){
                    await axios.post(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/tagOut/remove/${machine.latestTagOutId}`, { reason }, getAuthHeaders(makerspace));
                }
                else {
                    await axios.post(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/tagOut/create/${machine.id}`, { reason }, getAuthHeaders(makerspace));
                }
                alert(`Tagged ${machine.latestTagOutId ? 'In' : 'Out'} successfully!`);
                setReason('');
                setMachine({ ...machine, latestTagOutId: machine.latestTagOutId ? null : 'taggedOut' });
                await getTagOuts(10);
            }
        }
        catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getTagOuts(10);
    }, [makerspace]);

    return (
        <>
            <BlurHeader title={machine.name} pullToRefresh={() => getTagOuts(10)} refreshing={false} >
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:10 }}>
                    <Input
                        // margin={'$1'}
                        style={{ flex:1, backgroundColor:colors.background, padding:5, borderRadius:5 }}
                        placeholder='Reason'
                        value={reason}
                        onChangeText={setReason}
                        color={colors.text}
                        multiline={true}
                        borderColor={colors.text}
                    />
                    <Button
                        margin={'$1'}
                        height={'100%'}
                        onPress={handleSubmitTagOutAndIn}
                        backgroundColor={machine.latestTagOutId ? colors.secondaryAccent.dark : colors.accent.dark}
                        color={machine.latestTagOutId ? 'white' : colors.text}
                    >{machine.latestTagOutId ? 'Tag In' : 'Tag Out'}</Button>
                </View>
                {makerspace?.user?.userType === 'admin' &&
                <Button
                    onPress={() => router.push({ pathname:`../addMachine/${machine.id}`, params:{ machine:JSON.stringify(machine) } })}
                    margin={'$2'}
                    marginBottom={'$-4'}
                    backgroundColor={colors.accent.dark}
                    color={colors.text}
                >Edit Machine</Button>
                }
                <H2
                    color={colors.text}
                    padding={'$4'}
                    paddingTop={'$6'}
                >Tagout History</H2>
                <View style={{ padding:10 }}>
                    {tagOuts.map((tagOut) =>
                        <TagOutCard TagOut={tagOut} key={tagOut.id} colors={colors} />)}
                    <Button
                        onPress={getMoreTagOuts}
                        backgroundColor={colors.accent.dark}
                        color={colors.text}
                    >Load More</Button>
                </View>
                {loading ?
                    <Spinner
                        size='large'
                        color={colors.accent.dark}
                        marginTop={'$4'}
                        marginBottom={'$2'}
                    />
                    :
                    null
                }
            </BlurHeader>
            <CancelButton colors={colors} />
        </>
    );

}

const TagOutCard = (props:{TagOut:TagOutWithName, colors:Colors}) =>
    <YStack
        marginBottom={'$2'}
        width={'95%'}
        minHeight={150}
        backgroundColor={props.TagOut.removedReason ? props.colors.secondaryAccent.light : 'red'}
        borderRadius={7}
        alignSelf='center'
        key={props.TagOut.id}
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
        <XStack marginTop={'$2'}>
            <Text

                marginLeft={'$2'}
                color={props.colors.text}
            >{`${props.TagOut.userName} Tagged Out`}</Text>
            <Text
                marginLeft={'auto'}
                marginRight={'$2'}
                color={props.colors.text}
            >{new Date(props.TagOut.createdAt).toDateString()}</Text>
        </XStack>
        <H4
            marginLeft={'$2'}
            color={props.colors.text}
        >{props.TagOut.reason}</H4>
        {props.TagOut.removedBy &&
        <>
            <XStack>
                <Text
                    marginLeft={'$2'}
                    color={props.colors.text}
                >{`${props.TagOut.removedByName} Tagged In`}</Text>
                <Text
                    marginLeft={'auto'}
                    marginRight={'$2'}
                    color={props.colors.text}
                >{props.TagOut.removedDate ? new Date(props.TagOut.removedDate).toDateString() : 'Not Tagged In'}</Text>
            </XStack>
            <H4
                marginLeft={'$2'}
                color={props.colors.text}
            >{props.TagOut.removedReason}</H4>
        </>
        }

    </YStack>;
