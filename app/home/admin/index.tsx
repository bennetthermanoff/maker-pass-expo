
import { useEffect, useState } from 'react';
import BlurHeader from '../../../components/BlurHeader';
import { Button, H3, View, YStack, getTokens } from 'tamagui';
import { Wrench } from '@tamagui/lucide-icons';
import { useColors } from '../../../constants/Colors';
import { router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useMakerspace } from '../../../hooks/useMakerspace';
import axios from 'axios';
import { getAuthHeaders } from '../../../util/authRoutes';
import keyLogo from '../../../assets/images/key.png';
import { ImageSourcePropType } from 'react-native';
import { Color } from '../../../types/makerspaceServer';

export default function Admin() {
    const colors = useColors();
    const makerspace = useMakerspace();
    const [registrationKey, setRegistrationKey] = useState<string>('');
    useEffect(() => {
        if (makerspace){
            axios.get(`${makerspace.serverAddress}:${makerspace.serverPort}/api/ping/registrationKey`, getAuthHeaders(makerspace))
                .then((res) => {
                    setRegistrationKey(res.data.registrationKey);
                }).catch((err) => {
                    alert(err);
                });
        }}, [makerspace]);

    return (
        <BlurHeader title='Admin Settings'>
            <Button
                marginTop={'$5'}
                spaceFlex
                scaleIcon={2}
                fontSize={'$6'}
                textAlign="left"
                style={buttonStyle}
                iconAfter={Wrench}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
                onPress={() => {router.push('/machineGroups/');}}
            >Manage Machine Groups</Button>
            <Button
                spaceFlex
                scaleIcon={2}
                fontSize={'$6'}
                textAlign="left"
                style={buttonStyle}
                iconAfter={Wrench}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
                onPress={() => {router.push('/permissionGroups/');}}
            >Manage Permission Groups</Button>
            <Button
                spaceFlex
                scaleIcon={2}
                fontSize={'$6'}
                textAlign="left"
                style={buttonStyle}
                iconAfter={Wrench}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
                onPress={() => {router.push('/addMachine/new');}}
            >Add Machine</Button>

            <YStack
                width={'100%'}
                alignItems='center'

            >
                <H3
                    color={colors.text}
                    padding={'$4'}
                    paddingTop={'$2'}
                    paddingBottom={'$2'}
                >User Registration Code</H3>
                <View
                    marginBottom={'$15'}
                    padding={'$2'}
                    backgroundColor={'white'}
                >
                    <QRCode
                        value={`makerpass://--/makerspace/config?url=${makerspace?.serverAddress}&port=${makerspace?.serverPort}&registrationType=user&registrationKey=${registrationKey}`}
                        color={getTokens().color[ colors.accent.dark as Color].val}
                        size={250}
                        logo={keyLogo as ImageSourcePropType}
                        logoSize={85}
                        logoBackgroundColor='transparent'
                    />
                </View>
            </YStack>
        </BlurHeader>

    );
}

const buttonStyle = {
    margin: '$3',
    height: '$6',
    marginBottom: '$5',

};