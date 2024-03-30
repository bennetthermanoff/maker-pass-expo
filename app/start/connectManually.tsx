import { useState } from 'react';
import { Button, H4, Input, Spinner, Text, YStack, getTokens } from 'tamagui';
import { useColors } from '../../constants/Colors';
import { useMakerspace } from '../../hooks/useMakerspace';
import { router } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native';
import { Color } from '../../types/makerspaceServer';
import React from 'react';
import { handleConnect } from '../../util/handleURL';

export default function ConnectManually() {

    const [formData, setFormData] = useState<{
        URL: string;
        PORT: string;
        registrationKey: string;
        registrationType: 'admin' | 'user';
    }>({
        URL:'',
        PORT:'',
        registrationKey:'',
        registrationType:'user',
    });
    const colors = useColors();
    const makerspace = useMakerspace();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

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
                    >
                        <H4
                            color={colors.text}
                            marginBottom={'$-2'}
                            fontWeight={'100'}
                        >Connect Manually </H4>
                    </YStack>
                    <Input
                        placeholder={'http://192.168.0.1'}
                        value={formData.URL}
                        width={'95%'}
                        keyboardType={'url'}
                        autoCapitalize='none'
                        marginTop={'$4'}
                        backgroundColor={colors.inputBackground}
                        color={colors.text}
                        onChangeText={(text) => {
                            setFormData({ ...formData, URL: text });
                        }}

                    />
                    <Input
                        placeholder={'PORT'}
                        value={formData.PORT}
                        width={'95%'}
                        marginTop={'$4'}
                        autoCapitalize='none'
                        keyboardType={'number-pad'}
                        backgroundColor={colors.inputBackground}
                        color={colors.text}
                        onChangeText={(text) => {
                            setFormData({ ...formData, PORT: text });
                        }}

                    />
                    <Input
                        placeholder={'Registration Key'}
                        value={formData.registrationKey}
                        width={'95%'}
                        autoCapitalize='none'
                        marginTop={'$4'}
                        backgroundColor={colors.inputBackground}
                        color={colors.text}
                        onChangeText={(text) => {
                            setFormData({ ...formData, registrationKey: text });
                        }}
                    />

                    {!loading ?
                        <Button
                            width={'95%'}
                            color={colors.text}
                            backgroundColor={formData.registrationType === 'user' ? colors.accent.dark : colors.secondaryAccent.light}
                            marginTop={'$4'}
                            marginBottom={'$2'}
                            onPress={() => {
                                handleConnect(formData.URL.toLowerCase(), formData.PORT, formData.registrationType, formData.registrationKey);
                            }}
                            onLongPress={() => {
                                setFormData({ ...formData, registrationType: formData.registrationType === 'user' ? 'admin' : 'user' });
                            }}
                        >
                            {formData.registrationType === 'user' ? 'Connect' : 'Connect as Admin'}
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
