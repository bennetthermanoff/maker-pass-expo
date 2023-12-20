import { Link, router } from 'expo-router';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import { Pressable, StyleSheet } from 'react-native';
import { Button, Theme } from 'tamagui';
export default function LoginScreen() {
    return (
        <View style={styles.container}>

            <Text style={styles.title}>Welcome to TapPass!</Text>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

            <Button
                size="$7"
                backgroundColor="5"
                onPress={() => {
                    router.push('/start/login');
                }}
            >Login</Button>

            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

            <Button
                size="$7"
                onPress={() => {
                    router.push('/start/register');
                }}
            >Register</Button>

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
    greenRegisterButton: {
        backgroundColor: 'green',
        fontSize: 20,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#fff',
        padding: 20,
        margin: 5,
    },

});