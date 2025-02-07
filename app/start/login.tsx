import { useState } from 'react';
import { Button, H2, H4, Input, Spinner, Text, XStack, YStack, getTokens } from 'tamagui';
import { useColors } from '../../constants/Colors';
import { router } from 'expo-router';
import axios from 'axios';
import { addServerCredentials } from '../../util/makerspaces';
import { goHome } from '../../util/goHome';
import { KeyboardAvoidingView } from 'react-native';
import { Color } from '../../types/makerspaceServer';
import { GLOBAL } from '../../global';
import { currentServerSelector } from '../../state/slices/makerspacesSlice';
import { useSelector } from 'react-redux';

export default function LoginScreen() {

    const [formData, setFormData] = useState<{
        email?: string;
        password?: string;
    }>({});
    const colors = useColors();
    const makerspace = useSelector(currentServerSelector);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            setError('Error: Missing email or password');
            return;
        }
        else if (!makerspace) goHome();
        else {
            setLoading(true);
            axios.post(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/user/login`, { ...formData })
                .then(async(res) => {
                    const { userId,token,userType } = res.data;
                    await addServerCredentials({ serverId:makerspace.id, userId, userType, token });
                    goHome();
                }).catch((e) => {
                    setLoading(false);
                });
        }

    };

    return (
        <>

            <KeyboardAvoidingView
                behavior={'padding'}
                style={{ flex: 1 , justifyContent: 'center', alignItems: 'center', backgroundColor: getTokens().color[colors.background as Color].val }}

            >
                <Button
                    width={'auto'}
                    color={colors.secondaryAccent.dark}
                    backgroundColor={colors.inverseText}
                    style={{ position: 'absolute', top:0, left: 0 }}
                    marginTop={'$10'}
                    marginLeft={'$4'}
                    onPress={() => {
                        router.back();
                    }}
                >Back</Button>
                <YStack
                    style={{ flex: 0,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >

                    <YStack
                        style={{ flex: 0,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'left',
                        }}
                    // paddingTop={inputInFocus ? '30%' : '0%'}
                    >
                        <H4
                            color={colors.text}
                            marginBottom={'$-2'}
                            fontWeight={'100'}
                        >Logging into </H4>

                        <H2
                            color={colors.text}
                            padding={'$0'}
                        >{GLOBAL.serverName}</H2>
                    </YStack>
                    <Input
                        placeholder={'Email'}
                        value={formData.email}
                        width={'95%'}
                        marginTop={'$4'}
                        backgroundColor={colors.inputBackground}
                        color={colors.text}
                        onChangeText={(text) => {
                            setFormData({ ...formData, email: text });
                        }}

                    />
                    <Input
                        placeholder={'Password'}
                        value={formData.password}
                        width={'95%'}
                        marginTop={'$4'}
                        backgroundColor={colors.inputBackground}
                        color={colors.text}
                        autoCapitalize='none'
                        secureTextEntry={true}
                        onChangeText={(text) => {
                            setFormData({ ...formData, password: text });
                        }}

                    />
                    {!loading ?
                        <Button
                            width={'95%'}
                            color={colors.text}
                            backgroundColor={colors.accent.dark}
                            marginTop={'$4'}
                            marginBottom={'$2'}
                            onPress={() => {
                                handleLogin();
                            }}
                        >
                            Login
                        </Button> :
                        <Spinner
                            size={'large'}
                            color={colors.accent.dark}
                            marginTop={'$4'}
                            marginBottom={'$2'}
                        />}
                    {error && <Text
                        color={colors.secondaryAccent.dark}
                        marginBottom={'$2'}
                        fontWeight={'100'}
                    >{error}</Text>}
                </YStack>
            </KeyboardAvoidingView>
            {/* Back Button */}
            <YStack
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0  ,justifyContent: '', alignItems: 'left' }}
                backgroundColor={colors.text}
            >

            </YStack>

        </>
    );
}
