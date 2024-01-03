import { Text } from '../../../components/Themed';
import { Button, H3, YStack } from 'tamagui';
import { useColors } from '../../../constants/Colors';
import { removeServer } from '../../../util/makerspaces';
import { useMakerspace } from '../../../util/useMakerspace';
import { router } from 'expo-router';
import BlurHeader from '../../../components/BlurHeader';

export default function Machines() {
    const color = useColors();
    const makerspace = useMakerspace();
    return (
        <BlurHeader title="Settings">
            <YStack
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >

                <H3>Server Address</H3>
                <Text>{makerspace?.serverAddress}</Text>

                <Button
                    marginTop={'30%'}
                    width={'50%'}
                    size={'$4'}
                    backgroundColor={color.accent.dark}
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
                    onPress={async() => {
                        if (makerspace?.id){
                            await removeServer(makerspace?.id);
                        }
                        router.push('/scanner/enabling/a824e269-414b-4f00-820b-2d7da3592d88');
                    }}
                >Show Enabling Test Screen
                </Button>
            </YStack>
        </BlurHeader>
    );
}

