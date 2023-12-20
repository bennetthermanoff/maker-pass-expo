import { Button, H2, Text, YStack } from 'tamagui';
import { StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { useColors } from '../constants/Colors';
import { router } from 'expo-router';
export default function ConnectToMakerSpace() {
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
                marginBottom={'$2'}
                onPress={() => {
                    router.push('/scanner');
                }}
            >Connect with QR Code</Button>

            <Button width={'auto'} color={colors.secondaryAccent.dark} backgroundColor={colors.inverseText}>Connect Manually</Button>
        </YStack>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent:'center',
    },
});