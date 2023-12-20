import { useEffect, useState } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { YStack } from 'tamagui';
import { StyleSheet, Button, Text } from 'react-native';
import { handleURL } from '../util/handleURL';

export default function Scanner() {
    const [hasPermission, setHasPermission] = useState<null|Boolean>(null);
    const [scanned, setScanned] = useState(false);
    useEffect(() => {
        const getPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getPermissions();
    }, []);
    const handleBarCodeScanned = ({ type, data }:{type:string, data:string}) => {
        setScanned(true);
        if (data.startsWith('exp://')) {
            alert(`EXP Bar code with type ${type} and data ${data} has been scanned!`);
            handleURL(data);
        } else {
            alert(`Bar code with type ${type} and data ${data} has been scanned!`);
        }
    };
    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }
    return (
        <YStack
            style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-end',
            }}
        >
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
        </YStack>
    );
}
