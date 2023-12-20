import { useEffect, useState } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { H3, Spinner, XStack, YStack } from 'tamagui';
import { StyleSheet, Text } from 'react-native';
import { handleURL } from '../../util/handleURL';
import { router } from 'expo-router';
import { Button } from 'tamagui';
import { useColors } from '../../constants/Colors';

export default function Scanner() {
    const [hasPermission, setHasPermission] = useState<null|Boolean>(null);
    const [scanned, setScanned] = useState(false);
    const colors = useColors();
    useEffect(() => {
        const getPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getPermissions();
    }, []);
    const handleBarCodeScanned = async ({ type, data }:{type:string, data:string}) => {
        setScanned(true);
        setHasPermission(null);
        if (data.startsWith('exp://')) {
            await handleURL(data);
        } else {
            alert(`Bar code with type ${type} and data ${data} has been scanned!`);
        }
    };
    return (
        <YStack
            style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-end',
            }}
        >
            {hasPermission ? <>
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
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
                        backgroundColor={colors.secondaryAccent.dark}
                        onPress={() => {setHasPermission(null);router.back();}}
                    >Cancel</Button>

                </XStack>
            </> : <XStack
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
