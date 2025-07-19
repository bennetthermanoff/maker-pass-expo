import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Alert, ImageSourcePropType, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Button, Image, Text, View, XStack, YStack } from 'tamagui';
import BannerDark from '../../assets/images/banner-dark.png';
import Banner from '../../assets/images/banner.png';
import { colorSelector, currentServerSelector, removeServer } from '../../state/slices/makerspacesSlice';
import { useAppDispatch } from '../../state/store';
export default function LoginOrRegister() {
    const url = Linking.useURL();
    const colors = useSelector(colorSelector);
    const makerspace = useSelector(currentServerSelector);
    const dispatch = useAppDispatch();

    return (
        <>
            <YStack style={styles.container} backgroundColor={colors.background}>

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
                >Connected to {makerspace?.name}</Text>

                <Button
                    size={'$6'}
                    color={colors.text}
                    backgroundColor={colors.accent.dark}
                    marginTop={'$4'}
                    marginBottom={'$2'}
                    width={'80%'}
                    onPress={() => {
                        router.push('/start/register/');
                    }}
                >Register</Button>

                <Button
                    color={colors.secondaryAccent.dark}
                    backgroundColor={colors.inverseText}
                    width={'80%'}
                    onPress={() => {
                        router.push('/start/login');
                    }}
                >Login</Button>

            </YStack>
            <YStack
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0  }}
                backgroundColor={colors.background}
            >
                <XStack
                    marginBottom={'$8'}
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Button
                        color={colors.secondaryAccent.dark}
                        backgroundColor={colors.inverseText}
                        width={'auto'}
                        marginRight={'$4'}
                        onPress={() => {
                            Alert.alert(
                                'One Time Login','Please contact an admin to provide a One Time Login QR Code',
                                [
                                    {
                                        text: 'Cancel',
                                        onPress: () => {},
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Scan QR',
                                        onPress: () => {router.push('/scanner');},
                                    },

                                ],

                            );
                        }}
                    >Forgot Password</Button>
                    <Button
                        width={'auto'}
                        color={colors.secondaryAccent.dark}
                        backgroundColor={colors.inverseText}
                        onPress={async() => {
                            if (makerspace){
                                dispatch(removeServer(makerspace.id));
                            }
                            router.dismissTo('/');
                        }
                        }
                    >Change Makerspace</Button>
                </XStack>

            </YStack>
        </>
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
