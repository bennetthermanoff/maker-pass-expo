import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { interpolate } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { Button, H1, Spinner, XStack, YStack } from 'tamagui';
import { GLOBAL } from '../../global';
import { colorSelector } from '../../state/slices/makerspacesSlice';
import { goHomeOnBarAndCallFinished, handleTagOutURL, handleURL } from '../../util/handleURL';

type ScannerType = 'default'|'tagOut';

export default function Scanner({ scannerType = 'default' }:{scannerType?:ScannerType}) {
    const [permission, requestPermission] = useCameraPermissions();
    const [header, setHeader] = useState('Scan QR');
    const [scanned, setScanned] = useState(false);
    const colors = useSelector(colorSelector);

    const [animateTime,setAnimateTime] = useState(0);

    const DELAY = 1000 / 60;
    const timeIncrement = async () => {
        await new Promise((res) => setTimeout(res,DELAY));
        if (animateTime <= 1000 ){
            setAnimateTime(animateTime + DELAY);
        } else {
            goHomeOnBarAndCallFinished();
        }

    };

    useEffect(() => {
        if (scanned) {
            timeIncrement();
        }
    },[animateTime, scanned]);

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);
    const handleBarCodeScanned = async ({ type, data }:{type:string, data:string}) => {
        if (data.startsWith('makerpass://')) {
            GLOBAL.barRaceCondition = 0; //reset race condition
            setScanned(true);

            if (scannerType === 'tagOut'){
                handleTagOutURL(data);
            }
            else {
                const newText = handleURL(data);
                if (newText){
                    setHeader(newText);
                }
            }

        } else {
            alert('Non-MakerPass code Scanned!');
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
                {header}
            </H1>
            <XStack
                height={0}
                width={`${interpolate(animateTime, [0,1000],[0,100])}%`}
                borderColor={colors.secondaryAccent.dark}
                borderWidth={scanned ? 5 : 0}
            />
            <YStack>
                {permission && permission.granted ?
                    <CameraView
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        style={{ height: '90%' }}
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr'],
                        }}
                    /> :
                    <Spinner backgroundColor={colors.background} color={colors.text} width="100%" height="90%" />
                }
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
                        onPress={() => {router.back();}}
                    >Cancel</Button>

                </XStack>
            </YStack>

        </YStack>

    );
}
