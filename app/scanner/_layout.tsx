import { Stack } from 'expo-router';

export default function ScannerLayout(){
    return (
        <Stack screenOptions={{ headerShown: true, title:'Scan QR'  }} />
    );
}