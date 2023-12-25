import { Button, H2, Text, YStack } from 'tamagui';
import { StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { useColors } from '../constants/Colors';
import { Stack, router } from 'expo-router';
import { MakerspaceConfig } from '../types/makerspaceServer';
import { useEffect, useState } from 'react';
import { getCurrentServer } from '../util/makerspaces';
import { goHome } from '../util/goHome';

export default function ConnectToMakerSpace() {
    const [makerspace, setMakerspace] = useState<MakerspaceConfig|any>(null); // TODO: type this
    useEffect(() => {
        const getMakerspace = async () => {
            const makerspace = await getCurrentServer();
            setMakerspace(makerspace);
        };
        getMakerspace();
    },[]);
    useEffect(() => {
        if (makerspace){
            goHome();
        }
    }, [makerspace]);

    const colors = useColors();
    const url = Linking.useURL();

    return (

        <YStack style={styles.container} backgroundColor={colors.background} >
            <H2
                color={colors.text}
                padding={'$0'}
            >Welcome to MakerPass!</H2>
            <Text
                color={colors.text}
                padding={'$0'}
            >Let's get you connected to your MakerSpace.</Text>

            <Button
                size={'$6'}
                color={colors.text}
                backgroundColor={colors.accent.dark}
                marginTop={'$4'}
                width={'80%'}
                marginBottom={'$2'}
                onPress={() => {
                    router.push('/scanner');
                }}
            >Connect with QR Code</Button>

            <Button
                width={'80%'}
                color={colors.secondaryAccent.dark}
                backgroundColor={colors.inverseText}
                onPress={() => {
                    router.push('start/connectManually');
                }}
            >Connect Manually</Button>
        </YStack>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent:'center',
        width: '100%',
    },
});