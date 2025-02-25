import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Button } from 'tamagui';
import { Text, View } from '../components/Themed';
import { goHome } from '../util/goHome';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View style={styles.container}>
                <Text style={styles.title}>That's Embarrassing</Text>
                <Text style={styles.link}>We can't find that page.</Text>
                <Button onPress={() => goHome()}>Go Home</Button>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    link: {
        marginTop: 0,
        paddingVertical: 15,
    },
    linkText: {
        fontSize: 14,
        color: '#2e78b7',
    },
});
