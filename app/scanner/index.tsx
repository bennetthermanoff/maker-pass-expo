import { useEffect, useState } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { H1, H3, Spinner, XStack, YStack } from 'tamagui';
import { StyleSheet, Text } from 'react-native';
import { goHomeOnBarAndCallFinished, handleURL } from '../../util/handleURL';
import { router } from 'expo-router';
import { Button } from 'tamagui';
import { useColors } from '../../constants/Colors';
import BlurHeader from '../../components/BlurHeader';
import { goHome } from '../../util/goHome';
import { interpolate } from 'react-native-reanimated';
import { GLOBAL } from '../../global';

export default function Scanner() {
    const [hasPermission, setHasPermission] = useState<null|Boolean>(null);
    const [scanned, setScanned] = useState(false);
    const colors = useColors();

    const [animateTime,setAnimateTime] = useState(0);

    useEffect(() => {
        const DELAY = 1000 / 60; //60fps
        const timeIncrement = async () => {
            await new Promise((res) => setTimeout(res,DELAY));
            if (animateTime <= 1000 ){
                setAnimateTime(animateTime + DELAY);
            } else {
                goHomeOnBarAndCallFinished();
            }

        };
        // if (scanned){
        timeIncrement();
        // }

    },[animateTime, scanned]);

    useEffect(() => {
        const getPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getPermissions();
    }, []);
    const handleBarCodeScanned = async ({ type, data }:{type:string, data:string}) => {
        GLOBAL.barRaceCondition = 0; //reset race condition
        setScanned(true);
        setHasPermission(null);
        if (data.startsWith('exp://')) {
            const newText = handleURL(data);
        } else {
            alert(`Bar code with type ${type} and data ${data} has been scanned!`);
        }
    };
    return (
        <YStack
            style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-start',

            }}
            backgroundColor={colors.background}
            height={'100%'}
        >
            <H1
                color={colors.text}
                paddingTop={'$15'}
                backgroundColor={colors.background}
            >
                Scan QR
            </H1>
            <XStack
                height={0}
                width={`${interpolate(animateTime, [0,1000],[0,100])}%`}
                borderColor={colors.secondaryAccent.dark}
                borderWidth={5}
            />
            {hasPermission ? <YStack>
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={{ height:'90%' }}
                />
                <XStack
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                    }}
                >
                    <Button
                        marginBottom={'30%'}
                        size={'$5'}
                        minWidth={'40%'}
                        color={colors.text}
                        backgroundColor={colors.secondaryAccent.light}
                        onPress={() => {setHasPermission(null);router.back();}}
                    >Cancel</Button>

                </XStack>
            </YStack> : <XStack
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Spinner
                    size='large'
                    color={colors.accent.dark}
                />
                <H3
                    color={colors.text}
                    padding={'$0'}
                >Contacting Makerspace...</H3>
            </XStack>
            }

        </YStack>

    );
}
