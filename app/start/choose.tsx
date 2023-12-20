import { Button, H2, Text, XStack, YStack } from 'tamagui';
import { StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { useColors } from '../../constants/Colors';
import { Stack, router } from 'expo-router';
import { getCurrentServer, removeServer } from '../../util/makerspaces';
import { useEffect, useState } from 'react';
import { MakerspaceConfig } from '../../types/makerspaceServer';
export default function LoginOrRegister() {
    const url = Linking.useURL();
    const [makerspace, setMakerspace] = useState<null|MakerspaceConfig>(null);
    const colors = useColors();
    useEffect(() => {
        const getMakerspace = async () => {
            const makerspace = await getCurrentServer();
            setMakerspace(makerspace);
        };
        getMakerspace();
    }, []);

    return (
        <>
            <YStack style={styles.container} backgroundColor={colors.background}>
                <H2
                    color={colors.text}
                    padding={'$0'}
                >Welcome to MakerPass!</H2>
                <Text
                    color={colors.text}
                    padding={'$0'}
                >Connected to the {makerspace?.name}</Text>

                <Button
                    size={'$6'}
                    color={colors.text}
                    backgroundColor={colors.accent.dark}
                    marginTop={'$4'}
                    marginBottom={'$2'}
                    onPress={() => {
                        router.push('/start/register');
                    }}
                >Register</Button>

                <Button
                    width={'auto'}
                    color={colors.secondaryAccent.dark}
                    backgroundColor={colors.inverseText}
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
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                    }}
                >
                    <Button
                        width={'auto'}
                        color={colors.secondaryAccent.dark}
                        backgroundColor={colors.inverseText}
                        marginBottom={'$8'}
                        onPress={async() => {
                            if (makerspace){
                                await removeServer(makerspace.id);
                            }
                            while (router.canGoBack()){
                                router.back();
                            }
                            router.replace('/');
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
    },
});