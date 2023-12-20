import { useState } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

export default function LoginScreen() {

    const [formData, setFormData] = useState<{
        email?: string;
        password?: string;
    }>({});

    return (
        <>

            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    value={formData.email}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    value={formData.password}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        height: 40,
        margin: 10,
        borderWidth: 1,
        width: '80%',
        backgroundColor: '#152716',
        borderRadius: 10,
        padding: 10,
        color: '#fff',
    },
});

