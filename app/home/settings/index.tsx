
import { Button, H3, H2, Text, YStack, XStack, View, Image } from 'tamagui';
import { useColors } from '../../../constants/Colors';
import { removeServer } from '../../../util/makerspaces';
import { useMakerspace } from '../../../hooks/useMakerspace';
import { router } from 'expo-router';
import BlurHeader from '../../../components/BlurHeader';
import { clearImages } from '../../../util/machineImageCache';
import { ImageSourcePropType } from 'react-native';
import Banner from '../../../assets/images/banner.png';
import BannerDark from '../../../assets/images/banner-dark.png';
import { FileImage, Link, Unlink, Wrench } from '@tamagui/lucide-icons';
import { openBrowserAsync } from 'expo-web-browser';

export default function Machines() {
    const colors = useColors();
    const makerspace = useMakerspace();
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