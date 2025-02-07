import { View, YStack, Image, Text, H2, Button } from 'tamagui';
import { useColors } from '../../constants/Colors';
import { ImageSourcePropType } from 'react-native';
import Banner from '../../assets/images/banner.png';
import BannerDark from '../../assets/images/banner-dark.png';
import { useEffect } from 'react';
import { getForegroundPermissionsAsync, requestForegroundPermissionsAsync } from 'expo-location';
import { router } from 'expo-router';
import { currentServerSelector } from '../../state/slices/makerspacesSlice';
import { useSelector } from 'react-redux';

export default function LocationHeadsup() {
    const colors = useColors();
    const makerspace = useSelector(currentServerSelector);

    useEffect(() => {
        const getPermissions = async () => {
            const { status } = await getForegroundPermissionsAsync();
            if (status === 'granted'){
                router.replace('/start/choose');
            }
        };
        getPermissions();
    },[]);
    const requestPerms = async () => {
        const { status } = await requestForegroundPermissionsAsync();
        if (status === 'granted'){
            router.replace('/start/choose');
        }
    };

    return (
        <YStack
            backgroundColor={colors.background}
            width={'100%'}
            height={'100%'}
            style={{ justifyContent: 'center', alignItems: 'center' }}
        >
            <H2
                color={colors.text}
                padding={'$0'}
            >Location Required</H2>

            <Text
                color={colors.text}
                padding={'$4'}
                fontSize={'$5'}
                textAlign='center'
            >{`${makerspace?.name} requires location access to verify you are at the your MakerSpace when creating an account and enabling machines.`}</Text>
            <Button
                size={'$6'}
                color={colors.text}
                backgroundColor={colors.accent.dark}
                marginTop={'$4'}
                marginBottom={'$2'}
                width={'80%'}
                onPress={requestPerms}
            >Enable Location</Button>
        </YStack>
    );
}
