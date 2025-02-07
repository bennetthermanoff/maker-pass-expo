import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { TamaguiProvider } from 'tamagui';
import { darkModeSelector, fetchCurrentServerId, fetchServers } from '../state/slices/makerspacesSlice';
import { store, useAppDispatch } from '../state/store';
import config from '../tamagui.config';
import { configAxiosInterceptors } from '../util/handleError';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '/',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

    // const [makerspace, setMakerspace] = useState<MakerspaceConfig|any>(null); // TODO: type this
    // useEffect(() => {
    //     const getMakerspace = async () => {
    //         const makerspace = await getCurrentServer();
    //         setMakerspace(makerspace);
    //     };
    //     getMakerspace();
    // },[]);
    // useEffect(() => {
    //     if (makerspace){
    //         router.replace('/start/choose');
    //     }
    // }, [makerspace]);

    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
        InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
        ...FontAwesome.font,
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        configAxiosInterceptors();
    }, []);

    if (!loaded) {

        return;
    }

    return (
        <Provider store={store}>
            <RootLayoutNav />
        </Provider>
    );
}

function RootLayoutNav() {

    const dispatch = useAppDispatch();
    // this loads server data from secure store, from here on we can use redux
    // all actions to redux store also update secure store, see makerspacesSlice.ts
    useEffect(() => {
        dispatch(fetchCurrentServerId());
        dispatch(fetchServers());
    }, []);

    const isDarkMode = useSelector(darkModeSelector);
    return (
        <TamaguiProvider config={config}>
            <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}

                />
            </ThemeProvider>
        </TamaguiProvider>

    );
}
