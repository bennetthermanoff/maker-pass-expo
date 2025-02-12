import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { ImageSourcePropType, StyleSheet } from 'react-native';
import { Button, Image, Text, View, YStack } from 'tamagui';
import BannerDark from '../assets/images/banner-dark.png';
import Banner from '../assets/images/banner.png';
import { colorSelector } from '../state/slices/makerspacesSlice';
import { useSelector } from 'react-redux';

export default function ConnectToMakerSpace() {

    const colors = useSelector(colorSelector);
    const url = Linking.useURL();

    return (

        <YStack style={styles.container} backgroundColor={colors.background} >
            <View
                width={'90%'}
                height={'10%'}
            >
                <Image
                    source={(colors.text === 'white' ? BannerDark : Banner) as ImageSourcePropType}
                    resizeMode='contain'
                    width={'100%'}
                    height={'100%'}
                />
            </View>
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
                    router.push('/start/connectManually');
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