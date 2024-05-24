
import { Button, Text, XStack, Image } from 'tamagui';
import { useColors } from '../../../constants/Colors';
import { removeServer } from '../../../util/makerspaces';
import { useMakerspace } from '../../../hooks/useMakerspace';
import { router } from 'expo-router';
import BlurHeader from '../../../components/BlurHeader';
import { clearImages } from '../../../util/machineImageCache';
import { Alert, ImageSourcePropType } from 'react-native';
import Banner from '../../../assets/images/banner.png';
import BannerDark from '../../../assets/images/banner-dark.png';
import { FileImage, Key, Link, Trash2, Unlink } from '@tamagui/lucide-icons';
import { openBrowserAsync } from 'expo-web-browser';
import axios from 'axios';
import { getAuthHeaders } from '../../../util/authRoutes';
import { MakerspaceConfig } from '../../../types/makerspaceServer';
import { handleChangePassword } from '../../../util/handleChangePassword';

export default function Machines() {
    const colors = useColors();
    const makerspace = useMakerspace();

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
                                await removeServer(makerspace.id);
                                router.replace('/');
                            }).catch((err) => {
                                alert('Error: ' + JSON.stringify(err));
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
                        await removeServer(makerspace?.id);
                    }
                    router.replace('/');
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
                onPress={() => handleChangePassword()}
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