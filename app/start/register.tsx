import { Button, H2, H4, Input, Label, ScrollView, Spinner, XStack, YStack, getTokens } from 'tamagui';
import DropdownSelect from 'react-native-input-select';
import { useColors } from '../../constants/Colors';
import { useMakerspace } from '../../util/useMakerspace';
import { useEffect, useState } from 'react';
import { router, useGlobalSearchParams } from 'expo-router';
import { AdditionalInfoField, Color, MakerspaceTheme } from '../../types/makerspaceServer';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { KeyboardAvoidingView, Platform } from 'react-native';
import Checkbox from 'expo-checkbox';

import axios from 'axios';
import { DropdownProps } from 'react-native-input-select/lib/typescript/types/index.types';
import { GLOBAL } from '../../global';

export default function Register(){

    const colors = useColors();
    const makerspace = useMakerspace();
    const [loading, setLoading] = useState(false);
    const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoField[]>([]);
    const [formData, setFormData] = useState<{[key:string]:string|boolean}>({});
    const [errors, setErrors] = useState<{[key:string]:string}>({});

    useEffect(() => {
        const addInfo = async () => {
            if (!makerspace) return;
            const { data:pingResponse } = await axios.get(`${makerspace.serverAddress}:${makerspace.serverPort}/api/ping`);
            if (pingResponse.server === null){
                alert('Server not found');
                return;
            }
            const { additionalInfoFields } = pingResponse.server;
            setAdditionalInfo(additionalInfoFields);
        };
        addInfo();
    }, [makerspace]);

    return (
        <KeyboardAvoidingView
            style={{ backgroundColor:getTokens().color[colors.background as Color].val , minHeight:'100%' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
            <ScrollView
                backgroundColor={colors.background}
            >
                <YStack
                    style={{ flex: 1,
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        padding: 20,
                        minHeight:'100%',
                    }}
                    backgroundColor={colors.background}

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
                        animation={'medium'}
                        animateOnly={['transform']}
                    >

                        <YStack
                            style={{ flex: 0,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'left',
                                paddingTop: '30%',
                            }
                        >
                            <H4
                                color={colors.text}
                                marginBottom={'$-2'}
                                fontWeight={'100'}
                            >Registering for </H4>

                            <H2
                                color={colors.text}
                                padding={'$0'}
                            >{GLOBAL.serverName}</H2>
                        </YStack>
                        <Input
                            placeholder={'Email'}
                            value={formData.email as string}
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
                            value={formData.password as string}
                            width={'95%'}
                            marginTop={'$4'}
                            backgroundColor={colors.inputBackground}
                            color={colors.text}
                            secureTextEntry={true}
                            onChangeText={(text) => {
                                setFormData({ ...formData, password: text });
                            }}

                        />
                        <Input
                            placeholder={'Confirm Password'}
                            value={formData.password as string}
                            width={'95%'}
                            marginTop={'$4'}
                            backgroundColor={colors.inputBackground}
                            color={colors.text}
                            secureTextEntry={true}
                            onChangeText={(text) => {
                                setFormData({ ...formData, confirmPassword: text });
                            }}

                        />
                        {additionalInfo.map((field) => {
                            if (field.type === 'text'){
                                return (
                                    <Input
                                        placeholder={field.name}
                                        value={formData[field.name] as string}
                                        width={'95%'}
                                        marginTop={'$4'}
                                        backgroundColor={colors.inputBackground}
                                        color={colors.text}
                                        onChangeText={(text) => {
                                            setFormData({ ...formData, [field.name]: text });
                                        }}

                                    />
                                );
                            }
                            if (field.type === 'checkbox'){
                                return (
                                    <XStack alignItems="center" space="$4" marginTop='$4'>
                                        <Checkbox
                                            style={{ width: 30, height: 30 }}
                                            value={formData[field.name] as boolean}
                                            onValueChange={(newValue) => {
                                                setFormData({ ...formData, [field.name]: newValue });
                                            }}

                                        />

                                        <Label
                                            color={colors.text}
                                            fontWeight={'100'}
                                        >
                                            {field.name}
                                        </Label>
                                    </XStack>
                                );
                            }
                            if (field.type === 'date'){
                                if (Platform.OS == 'android'){
                                    return (
                                        <XStack
                                            flexDirection="row"
                                            alignItems="center"
                                            space="$4"
                                            marginTop='$4'
                                        >
                                            <H4
                                                color={colors.text}
                                                fontWeight={'100'}
                                            >{field.name}</H4>
                                            <Button

                                                color={colors.text}
                                                backgroundColor={colors.accent.dark}
                                                onPress={() => {
                                                    DateTimePickerAndroid.open({
                                                        value: new Date(),
                                                        mode: 'date',
                                                        onChange: (event, selectedDate) => {
                                                            if (selectedDate !== undefined) {
                                                                setFormData({ ...formData, [field.name]: selectedDate.toString() });
                                                            }
                                                        },
                                                    });
                                                }}
                                            >{new Date().toDateString()}</Button>
                                        </XStack>
                                    );
                                } else {
                                    return (
                                        <XStack  marginTop='$4'>
                                            <H4
                                                color={colors.text}
                                                fontWeight={'100'}
                                            >{field.name}</H4>
                                            <DateTimePicker
                                                value={new Date()}
                                                mode={'date'}
                                                onChange={(event, selectedDate) => {
                                                    if (selectedDate !== undefined) {
                                                        setFormData({ ...formData, [field.name]: selectedDate.toString() });
                                                    }
                                                }}
                                            />
                                        </XStack>
                                    );
                                }
                            }
                            if (field.type === 'dropdown' && field.options){
                                return (
                                    <XStack marginTop='$4' marginBottom='$-4'>
                                        <DropdownSelect
                                            label={field.name}
                                            labelStyle={{ color: colors.text }}
                                            dropdownStyle={{ backgroundColor: getTokens().color[colors.inputBackground as Color].val,
                                                borderColor: getTokens().color[colors.inputBackground as Color].val,
                                                shadowColor: getTokens().color[colors.inputBackground as Color].val,
                                            }}
                                            dropdownIconStyle={{ backgroundColor: getTokens().color[colors.accent.dark as Color].val ,
                                                padding: 10,
                                                margin: -10,
                                                borderRadius: 10,
                                                borderColor: getTokens().color[colors.accent.light as Color].val,
                                                borderWidth: 1,
                                            }}
                                            selectedItemStyle={{ color: colors.text }}
                                            modalOptionsContainerStyle={{ backgroundColor: getTokens().color[colors.background as Color].val,
                                            }}
                                            checkboxLabelStyle={{ color: colors.text }}
                                            placeholderStyle={{ color: colors.text }}
                                            primaryColor={getTokens().color[colors.accent.dark as Color].val}
                                            listComponentStyles={{
                                                itemSeparatorStyle: {
                                                    borderColor: getTokens().color[colors.secondaryAccent.light as Color].val,
                                                    backgroundColor: getTokens().color[colors.secondaryAccent.light as Color].val,
                                                },
                                            }}
                                            placeholder='Select an option'
                                            options={field.options.map((option) => ({ label: option, value: option }))}
                                            selectedValue={formData[field.name]}
                                            onValueChange={(value:string) => {
                                                setFormData({ ...formData, [field.name]: value });
                                            }}
                                        />
                                    </XStack>

                                );
                            }

                        })}

                        {!loading ?
                            <Button
                                width={'95%'}
                                color={colors.text}
                                backgroundColor={colors.accent.dark}
                                marginTop={'$4'}
                                marginBottom={'$2'}
                                onPress={() => {
                                    handleRegister();
                                }}
                            >
                                Register
                            </Button> :
                            <Spinner
                                size={'large'}
                                color={colors.accent.dark}
                                marginTop={'$4'}
                                marginBottom={'$2'}
                            />}

                    </YStack>
                </YStack>
                {/* Back Button */}
                <YStack
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0  ,justifyContent: '', alignItems: 'left' }}
                    backgroundColor={colors.text}
                >

                </YStack>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
