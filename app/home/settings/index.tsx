import { StyleSheet } from 'react-native';

import EditScreenInfo from '../../../components/EditScreenInfo';
import { Text, View } from '../../../components/Themed';
import { Button } from 'tamagui';
import { useColors } from '../../../constants/Colors';
import { removeServer } from '../../../util/makerspaces';
import { useMakerspace } from '../../../util/useMakerspace';
import { router } from 'expo-router';

export default function Machines() {
    const color = useColors();
    const makerspace = useMakerspace();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tab One</Text>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <EditScreenInfo path="app/home/settings/index.tsx" />
            <Button
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});
