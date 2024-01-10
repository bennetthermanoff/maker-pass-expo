
import { Button, H3, H2, Text, YStack, XStack } from 'tamagui';
import { useColors } from '../../../constants/Colors';
import { removeServer } from '../../../util/makerspaces';
import { useMakerspace } from '../../../util/useMakerspace';
import { router } from 'expo-router';
import BlurHeader from '../../../components/BlurHeader';
import { clearImages } from '../../../util/machineImageCache';

export default function Machines() {
    const color = useColors();
    const makerspace = useMakerspace();
    return (
        <BlurHeader title="Settings">
            <YStack
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
                <H2
                    color={color.text}
                    padding={'$0'}
                >Welcome to MakerPass!</H2>
                <Text
                    color={color.text}
                    padding={'$0'}
                    paddingBottom={'$4'}
                >Connected to the {makerspace?.name}</Text>
                <XStack
                    alignItems={'center'}
                >

                    <Text color={color.text}>{'Server Address: ' + makerspace?.serverAddress}</Text>
                </XStack>
                <Button
                    marginTop={'30%'}
                    width={'50%'}
                    size={'$4'}
                    backgroundColor={color.accent.dark}
                    color={color.text}
                    onPress={async() => {
                        if (makerspace?.id){
                            await removeServer(makerspace?.id);
                        }
                        router.replace('/');
                    }}
                >Logout
                </Button>
                <Button
                    marginTop={'30%'}
                    width={'50%'}
                    size={'$4'}
                    backgroundColor={color.accent.dark}
                    color={color.text}
                    onPress={() => {
                        clearImages();
                    }}
                >Clear Image Cache
                </Button>
            </YStack>
        </BlurHeader>
    );
}

