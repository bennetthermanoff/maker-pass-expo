import { Button, Card, Paragraph, Image, XStack, H2, CardProps, YStack, Circle, Spacer } from 'tamagui';
import { Plus } from '@tamagui/lucide-icons';
import  BlurHeader  from '../../components/BlurHeader';
import { useColors, Colors } from '../../constants/Colors';
import { useMakerspace } from '../../hooks/useMakerspace';
import { router } from 'expo-router';
import { useMachines } from '../../hooks/useMachines';
import { Machine } from '../../types/machine';
import { LinearGradient } from '@tamagui/linear-gradient';
import { QrCode } from '@tamagui/lucide-icons';
import React, { useEffect, useState } from 'react';
import { interpolate } from 'react-native-reanimated';
import defaultImage from '../../assets/images/adaptive-icon.png';
import { ImageSourcePropType } from 'react-native';
export default function Machines() {
    const colors = useColors();
    const { machines, loading, error, debouncedGetMachines, disableMachine, makerspace } = useMachines();
    return (
        <>
            <BlurHeader title="Machines" debouncedPullToRefresh={debouncedGetMachines}>
                {makerspace?.user?.userType === 'admin' && <Button
                    iconAfter={Plus}
                    scaleIcon={1.5}
                    fontSize={'$5'}
                    textAlign="left"
                    color={colors.text}
                    backgroundColor={colors.accent.dark}
                    width={140}
                    alignSelf='flex-end'
                    margin={'$4'}
                    onPress={() => {
                        router.push({ pathname: '/addMachine/new', params: {} });
                    }}
                >Machine</Button>}

                {machines?.map((machine) => <MachineCard
                    machine={machine}
                    colors={colors}
                    disableMachine={disableMachine}
                    key={machine.id}
                    cardProps={
                        { onLongPress:() => {
                            if (makerspace?.user?.userType === 'admin'){
                                router.push({ pathname: `/addMachine/${machine.id}`, params: { machine:JSON.stringify(machine) } });
                            }
                        },
                        }}
                />)}
                {loading && <Paragraph>Loading...</Paragraph>}
                {error && <Paragraph>{error}</Paragraph>}

            </BlurHeader>
            <YStack
                position='absolute'
                bottom={0}
                right={0}
                backgroundColor={'transparent'}
            >
                <Button
                    color={colors.text}
                    iconAfter={QrCode}
                    margin={'$4'}
                    scaleIcon={2}
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

export const MachineCard = (props: {machine:Machine, uri?:string, cardProps?:CardProps, colors:Colors, disableMachine:(machineId:string)=>void }) => {
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
            out.bottomLine = `Enabled By ${props.machine.lastUsedBy}`;
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
            style={{
            }}
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
                    {props.machine.enabled ?
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
                            height={180}
                            marginBottom={-180}
                            zIndex={1}
                            colors={props.colors.text === 'black' ? ['#ffffff', '#ffffff00'] : ['#000000', '#00000000']}
                            opacity={1}
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
                            boxShadow='0px 0px 10px 0px rgba(0,0,0,0.75)'
                        />

                    </YStack>

                </Card.Background>
            </Card>
        </YStack>);
};
