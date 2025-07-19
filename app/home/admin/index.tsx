
import { Wrench } from '@tamagui/lucide-icons';
import axios from 'axios';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageSourcePropType } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSelector } from 'react-redux';
import { Button, H3, Text, View, YStack, getTokens } from 'tamagui';
import keyLogo from '../../../assets/images/key.png';
import BlurHeader from '../../../components/BlurHeader';
import { colorSelector, currentServerSelector } from '../../../state/slices/makerspacesSlice';
import { Color } from '../../../types/makerspaceServer';
import { getAuthHeaders } from '../../../util/authRoutes';
import { copyQR } from '../../../util/handleURL';

export default function Admin() {
    const colors = useSelector(colorSelector);
    const makerspace = useSelector(currentServerSelector);
    const [registrationKey, setRegistrationKey] = useState<string>('');

    const getQR = () => `makerpass://--/makerspace/config?url=${makerspace?.serverAddress}&port=${makerspace?.serverPort}&registrationType=user&registrationKey=${registrationKey}`;
    useEffect(() => {
        if (makerspace) {
            axios.get(`${makerspace.serverAddress}:${makerspace.serverPort}/api/ping/registrationKey`, getAuthHeaders(makerspace))
                .then((res) => {
                    setRegistrationKey(res.data.registrationKey);
                });
        }
    }, [makerspace]);

    return (
        <BlurHeader title='Admin Settings'>
            <Button
                marginTop={'$5'}
                spaceFlex
                scaleIcon={2}
                fontSize={'$6'}
                textAlign="left"
                style={buttonStyle}
                aspectRatio={7}
                alignSelf='center'
                width={'95%'}
                iconAfter={Wrench}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
                onPress={() => { router.push('/machineGroups/'); }}
            >Manage Machine Groups</Button>
            <Button
                spaceFlex
                scaleIcon={2}
                fontSize={'$6'}
                aspectRatio={7}
                alignSelf='center'
                width={'95%'}
                marginTop={'$3'}
                textAlign="left"
                style={buttonStyle}
                iconAfter={Wrench}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
                onPress={() => { router.push('/permissionGroups/'); }}
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
                aspectRatio={7}
                alignSelf='center'
                width={'95%'}
                marginTop={'$3'}
                onPress={() => { router.push('/locationGroups/'); }}
            >Manage Location Groups</Button>
            <Button
                spaceFlex
                scaleIcon={2}
                fontSize={'$6'}
                textAlign="left"
                style={buttonStyle}
                iconAfter={Wrench}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
                aspectRatio={7}
                alignSelf='center'
                width={'95%'}
                marginTop={'$3'}
                onPress={() => { router.push('/addMachine/new'); }}
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
                    onLongPress={() => copyQR(getQR())}
                >
                    <QRCode
                        value={getQR()}
                        color={getTokens().color[colors.accent.dark as Color].val}
                        size={250}
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
