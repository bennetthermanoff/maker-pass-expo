
import { FileImage, Key, Link, Trash2, Unlink } from '@tamagui/lucide-icons';
import axios from 'axios';
import { router } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { Alert, ImageSourcePropType } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Image, Text, XStack } from 'tamagui';
import BannerDark from '../../../assets/images/banner-dark.png';
import Banner from '../../../assets/images/banner.png';
import BlurHeader from '../../../components/BlurHeader';
import { colorSelector, currentServerSelector, removeServer } from '../../../state/slices/makerspacesSlice';
import { getAuthHeaders } from '../../../util/authRoutes';
import { goHome } from '../../../util/goHome';
import { handleChangePassword } from '../../../util/handleChangePassword';
import { clearImages } from '../../../util/machineImageCache';

export default function Machines() {
    const colors = useSelector(colorSelector);
    const makerspace = useSelector(currentServerSelector);
    const dispatch = useDispatch();
    const handleDeleteAccount = async () => {
        if (makerspace?.id){
            Alert.alert(
                'Delete Account', 'Are you sure you want to delete your account? This action is irreversible.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        onPress: () => {
                            axios.delete(
                                `${makerspace.serverAddress}:${makerspace.serverPort}/api/user/${makerspace.user?.userId}`,
                                getAuthHeaders(makerspace),
                            ).then(async (response) => {
                                dispatch(removeServer(makerspace.id));
                                router.replace('/');
                            }).catch((err) => {
                            });

                        },
                        style: 'destructive',
                    },
                ],
            );
        }
    };

    return (
        <BlurHeader title="Settings">

            <Button
                spaceFlex
                marginTop={'$6'}
                scaleIcon={2}
                fontSize={'$6'}
                textAlign="left"
                style={buttonStyle}
                iconAfter={Unlink}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
                onPress={async() => {
                    if (makerspace?.id){
                        dispatch(removeServer(makerspace.id));
                    }
                    goHome();
                }}
            >Disconnect and Logout</Button>

            <Button
                spaceFlex
                scaleIcon={2}
                fontSize={'$6'}
                textAlign="left"
                style={buttonStyle}
                iconAfter={Key}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
                onPress={() => handleChangePassword(makerspace)}
            >Change Password</Button>
            <Button
                spaceFlex
                scaleIcon={2}
                fontSize={'$6'}
                textAlign="left"
                style={buttonStyle}
                iconAfter={FileImage}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
                onPress={() => {clearImages();}}
            >Clear Image Cache</Button>
            <Button
                spaceFlex
                scaleIcon={2}
                fontSize={'$6'}
                textAlign="left"
                style={buttonStyle}
                iconAfter={Trash2}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
                onPress={() => handleDeleteAccount()}
            >Delete Account</Button>
            <Button
                spaceFlex
                scaleIcon={2}
                fontSize={'$6'}
                textAlign="left"
                style={buttonStyle}
                marginBottom={'0'}
                iconAfter={Link}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
                onPress={() => {openBrowserAsync('https://github.com/bennetthermanoff/maker-pass-server');}}
            >
                <Image
                    marginTop={'$2'}
                    source={(colors.text === 'white' ? BannerDark : Banner) as ImageSourcePropType}
                    resizeMode='contain'
                    width={'60%'}
                    height={'100%'}
                />

            </Button>
            <Text
                color={colors.text}
                padding={'$0'}
                paddingBottom={'$5'}
                marginTop={'$-2'}
                paddingLeft={'$4'}
            >MakerPass is free. Learn more about hosting your own instance at our github</Text>

            <Text
                color={colors.text}
                padding={'$0'}
                paddingBottom={'$0'}
                paddingLeft={'$4'}
            >Connected to the {makerspace?.name}</Text>
            <XStack
                alignItems={'center'}
                paddingLeft={'$4'}
            >

                <Text color={colors.text}>{'Server Address: ' + makerspace?.serverAddress}</Text>
            </XStack>

        </BlurHeader>
    );
}

const buttonStyle = {
    margin: '$3',
    height: '$6',
    marginBottom: '$5',

};