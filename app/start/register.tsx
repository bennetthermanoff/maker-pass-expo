import { Button, H2, H4, Input, Label, ScrollView, Spinner, XStack, YStack, getTokens } from 'tamagui';
import DropdownSelect from 'react-native-input-select';
import { useColors } from '../../constants/Colors';
import { useEffect, useState } from 'react';
import { router, useGlobalSearchParams } from 'expo-router';
import { AdditionalInfoField, Color, MakerspaceTheme } from '../../types/makerspaceServer';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { KeyboardAvoidingView, Platform } from 'react-native';
import * as Location from 'expo-location';
import Checkbox from 'expo-checkbox';
import axios from 'axios';
import { DropdownProps } from 'react-native-input-select/lib/typescript/types/index.types';
import { GLOBAL } from '../../global';
import React from 'react';
import { goHome } from '../../util/goHome';
import { currentServerSelector } from '../../state/slices/makerspacesSlice';
import { useSelector } from 'react-redux';

export default function Register(){

    const colors = useColors();
    const makerspace = useSelector(currentServerSelector);
    const [loading, setLoading] = useState(false);
    const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoField[]>([]);
    const [formData, setFormData] = useState<{[key:string]:string|boolean}>({});
    const [canRegisterAsAdmin, setCanRegisterAsAdmin] = useState(false);
    const [registrationType, setRegistrationType] = useState<'admin'|'user'>('user');
    const [errors, setErrors] = useState<{[key:string]:string}>({});

    useEffect(() => {
        const addInfo = async () => {
            if (!makerspace) return;
            const { data:pingResponse } = await axios.post(`${makerspace.serverAddress}:${makerspace.serverPort}/api/ping`, { registrationKey:makerspace.registrationKey, registrationType:makerspace.registrationType });
            if (pingResponse.server === null){
                alert('Server not found');
                return;
            }
            const { additionalInfoFields } = pingResponse.server;
            if (pingResponse.registrationType === 'admin'){
                setCanRegisterAsAdmin(true);
                setRegistrationType('admin');
            }
            setAdditionalInfo(additionalInfoFields);
        };
        addInfo();
    }, [makerspace]);

    const buttonLabel = () => {
        if (!canRegisterAsAdmin){
            return 'Register';
        } else {
            return registrationType === 'user' ? 'Register as Normal User' : 'Register as Admin';
        }
    };
    type RegisterBody = {
        name: string;
        email: string;
        password: string;
        location?:{
            lat: number;
            lng: number;
        }
        registrationType: 'admin' | 'user';
        registrationKey?: string;
        additionalInfo?: object;
    };
    const handleRegister = async () => {
        const newErrors:{[key:string]:string} = {};
        if (!formData.email) newErrors.email = 'Missing email';
        if (!formData.password) newErrors.password = 'Missing password';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.name) newErrors.name = 'Missing name';
        if (RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$').test(formData.email as string) === false) newErrors.email = 'Invalid email';
        additionalInfo.forEach((field) => {
            if (field.required && !formData[field.name]) newErrors[field.name] = 'Missing ' + field.name;
            if (field.regEx && !RegExp(field.regEx).test(formData[field.name] as string)) newErrors[field.name] = 'Invalid ' + field.name;
        });
        if (Object.keys(newErrors).length > 0){
            setErrors(newErrors);
            return;
        }
        setLoading(true);
        const { name, email, password } = formData;
        const additionalFilteredInfo = Object.keys(formData).filter((key) => key !== 'name' && key !== 'email' && key !== 'password' && key !== 'confirmPassword').map((key) => ({ name: key, value: formData[key] }));
        let location = undefined;
        if (makerspace?.hasGeoFences){
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Location permission required');
                setLoading(false);
                return;
            }
            const position = await Location.getCurrentPositionAsync({});
            location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
        }

        axios.post(
            `${makerspace?.serverAddress}:${makerspace?.serverPort}/api/user/register`,
            { name, email, password, registrationType, registrationKey:makerspace?.registrationKey, additionalInfo:additionalFilteredInfo, location } as RegisterBody,
        )
            .then((response) => {
            //if 200
                setLoading(false);
                alert('Account Created!');
                router.replace('/start/login');
            })
            .catch((error) => {
                setLoading(false);
                alert('Registration failed: ' + JSON.stringify(error.response.data.message));
            });

    };

    return (
        <KeyboardAvoidingView
            style={{ backgroundColor:getTokens().color[colors.background as Color].val , minHeight:'100%' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >

            <ScrollView
                backgroundColor={colors.background}
            >

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
                            alignItems: 'left',
                            paddingTop: '30%',
                        }}
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
                        keyboardType={'email-address'}
                        width={'95%'}
                        marginTop={'$4'}
                        backgroundColor={colors.inputBackground}
                        color={colors.text}
                        onChangeText={(text) => {
                            setFormData({ ...formData, email: text });
                        }}

                    />
                    {errors.email && <Label color={colors.secondaryAccent.dark}>{errors.email}</Label>}
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
                    {errors.password && <Label color={colors.secondaryAccent.dark}>{errors.password}</Label>}
                    <Input
                        placeholder={'Confirm Password'}
                        value={formData.confirmPassword as string}
                        width={'95%'}
                        marginTop={'$4'}
                        backgroundColor={colors.inputBackground}
                        color={colors.text}
                        secureTextEntry={true}
                        onChangeText={(text) => {
                            setFormData({ ...formData, confirmPassword: text });
                        }}

                    />
                    {errors.confirmPassword && <Label color={colors.secondaryAccent.dark}>{errors.confirmPassword}</Label>}
                    <Input
                        placeholder={'Name'}
                        value={formData.name as string}
                        width={'95%'}
                        marginTop={'$4'}
                        backgroundColor={colors.inputBackground}
                        color={colors.text}
                        onChangeText={(text) => {
                            setFormData({ ...formData, name: text });
                        }}

                    />
                    {errors.name && <Label color={colors.secondaryAccent.dark}>{errors.name}</Label>}
                    {additionalInfo.map((field,index) => {
                        if (field.type === 'text'){
                            return (
                                <>
                                    <Input
                                        placeholder={field.name}
                                        value={formData[field.name] as string}
                                        width={'95%'}
                                        marginTop={'$4'}
                                        key={index}
                                        backgroundColor={colors.inputBackground}
                                        color={colors.text}
                                        onChangeText={(text) => {
                                            setFormData({ ...formData, [field.name]: text });
                                        }}

                                    />
                                    {errors[field.name] && <Label color={colors.secondaryAccent.dark}>{errors[field.name]}</Label>}
                                </>
                            );
                        }
                        if (field.type === 'number'){
                            return (
                                <>
                                    <Input
                                        placeholder={field.name}
                                        value={formData[field.name] as string}
                                        width={'95%'}
                                        marginTop={'$4'}
                                        key={index}
                                        backgroundColor={colors.inputBackground}
                                        color={colors.text}
                                        keyboardType={'number-pad'}
                                        onChangeText={(text) => {
                                            setFormData({ ...formData, [field.name]: text });
                                        }}

                                    />
                                    {errors[field.name] && <Label color={colors.secondaryAccent.dark}>{errors[field.name]}</Label>}
                                </>
                            );
                        }
                        if (field.type === 'tel'){
                            return (
                                <>
                                    <Input
                                        placeholder={field.name}
                                        value={formData[field.name] as string}
                                        width={'95%'}
                                        marginTop={'$4'}
                                        key={index}
                                        backgroundColor={colors.inputBackground}
                                        color={colors.text}
                                        keyboardType={'phone-pad'}
                                        onChangeText={(text) => {
                                            setFormData({ ...formData, [field.name]: text });
                                        }}

                                    />
                                    {errors[field.name] && <Label color={colors.secondaryAccent.dark}>{errors[field.name]}</Label>}
                                </>
                            );
                        }
                        if (field.type === 'checkbox'){
                            return (
                                <>
                                    <XStack key={index} alignItems="center" space="$4" marginTop='$4'>
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
                                    {errors[field.name] && <Label color={colors.secondaryAccent.dark}>{errors[field.name]}</Label>}
                                </>
                            );
                        }
                        if (field.type === 'date'){
                            if (Platform.OS == 'android'){
                                return (
                                    <>
                                        <XStack
                                            key={index}
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
                                                                setFormData({ ...formData, [field.name]: selectedDate.toDateString() });
                                                            }
                                                        },
                                                    });
                                                }}
                                            >{new Date().toDateString()}</Button>
                                        </XStack>
                                        {errors[field.name] && <Label color={colors.secondaryAccent.dark}>{errors[field.name]}</Label>}
                                    </>
                                );
                            } else {
                                return (
                                    <>
                                        <XStack key={index} marginTop='$4'>
                                            <H4
                                                color={colors.text}
                                                fontWeight={'100'}
                                            >{field.name}</H4>
                                            <DateTimePicker
                                                value={formData[field.name] ? new Date(formData[field.name] as string) : new Date()}
                                                mode={'date'}
                                                onChange={(event, selectedDate) => {
                                                    if (selectedDate !== undefined) {
                                                        setFormData({ ...formData, [field.name]: selectedDate.toDateString() });
                                                    }
                                                }}
                                            />
                                        </XStack>
                                        {errors[field.name] && <Label color={colors.secondaryAccent.dark}>{errors[field.name]}</Label>}
                                    </>
                                );
                            }
                        }
                        if (field.type === 'dropdown' && field.options){
                            return (
                                <>
                                    <XStack key={index} marginTop='$4' marginBottom='$-4'>
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
                                    {errors[field.name] && <Label color={colors.secondaryAccent.dark}>{errors[field.name]}</Label>}
                                </>
                            );
                        }

                    })}

                    {!loading ?
                        <Button
                            width={'95%'}
                            color={colors.text}
                            backgroundColor={registrationType === 'user' ? colors.accent.dark : colors.secondaryAccent.light}
                            marginTop={'$4'}
                            marginBottom={'$2'}
                            onPress={() => {
                                handleRegister();
                            }}
                            onLongPress={() => {
                                setRegistrationType(registrationType === 'user' ? 'admin' : 'user');
                            }}
                        >
                            {buttonLabel()}
                        </Button> :
                        <Spinner
                            size={'large'}
                            color={colors.accent.dark}
                            marginTop={'$4'}
                            marginBottom={'$2'}
                        />}

                </YStack>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
