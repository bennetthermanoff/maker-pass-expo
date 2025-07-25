import { useLocalSearchParams } from 'expo-router';
import { ImageSourcePropType } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSelector } from 'react-redux';
import { Label, View, YStack, getTokens } from 'tamagui';
import keyLogo from '../../assets/images/key.png';
import BlurHeader from '../../components/BlurHeader';
import { colorSelector, currentServerSelector } from '../../state/slices/makerspacesSlice';
import { Color } from '../../types/makerspaceServer';

export default function OneTimeLogin() {
    const local = useLocalSearchParams();
    const loginToken = local.loginToken as string;
    const userId = local.userId as string;
    const userType = local.userType as string;
    const makerspace = useSelector(currentServerSelector);
    const colors = useSelector(colorSelector);

    const getQR = () => `makerpass://--/makerspace/login?token=${loginToken}&userId=${userId}&userType=${userType}&serverId=${makerspace?.id}`;
    return <>
        <BlurHeader hasBackButton title='One Time Login'>
            <YStack
                style={{ flex: 1, alignItems: 'center' }}
            >
                <Label
                    color={colors.text}
                    marginTop={'$4'}
                    marginBottom={'$2'}
                    lineHeight={'$2'}
                    width={'95%'}
                    pressStyle={{ color: colors.text }}
                ></Label>
                <View
                    marginBottom={'$15'}
                    padding={'$2'}
                    backgroundColor={'white'}
                >

                    <QRCode
                        value={getQR()}
                        color={getTokens().color[ colors.accent.dark as Color].val}
                        size={250}
                    />
                </View>
            </YStack>
        </BlurHeader>
    </>
    ;
}
