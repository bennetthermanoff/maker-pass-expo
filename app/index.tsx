import { SplashScreen } from 'expo-router';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { Appearance, ImageSourcePropType } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { Image, getTokens } from 'tamagui';
import splashDark from '../assets/images/splash-dark.png';
import splash from '../assets/images/splash.png';
import { fetchLocationGroups, fetchMachineGroups, fetchMachines } from '../state/slices/machinesSlice';
import { colorSelector, currentServerSelector } from '../state/slices/makerspacesSlice';
import { fetchPermissionGroups, fetchPermissionsForUser } from '../state/slices/permissionsSlice';
import { useAppDispatch } from '../state/store';
import { Color } from '../types/makerspaceServer';
import { goHome } from '../util/goHome';

export default function Splash() {
    const colors = useSelector(colorSelector);
    const makerspace = useSelector(currentServerSelector);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (makerspace?.id){
            dispatchInitialData();
        }
    }, [makerspace]);
    const dispatchInitialData = debounce(() => {
        if (makerspace){
            dispatch(fetchMachines(makerspace));
            dispatch(fetchMachineGroups(makerspace));
            dispatch(fetchLocationGroups(makerspace));
            dispatch(fetchPermissionGroups(makerspace));
            dispatch(fetchPermissionsForUser(makerspace));
        }
    },5000, { leading: true, trailing: false });
    const [endColor, setEndColor] = useState<string>(getTokens().color[`$blue4${Appearance.getColorScheme() === 'dark' ? 'Dark' : 'Light'}`].val);
    const colorScheme = Appearance.getColorScheme();
    const interp  = useSharedValue(0);
    useEffect(() => {
        if (colors !== null){
            setEndColor(getTokens().color[colors.background as Color].val);
            new Promise((resolve) => setTimeout(resolve, 300)).then(() => {
                SplashScreen.hideAsync();
                interp.value = withTiming(1, { duration: 1200 });
                new Promise((resolve) => setTimeout(resolve, 1200)).then(() => {
                    goHome();
                });
            });
        } else {
            new Promise((resolve) => setTimeout(resolve, 1500)).then(() => {
                SplashScreen.hideAsync();
                interp.value = withTiming(1, { duration: 1200 });
                new Promise((resolve) => setTimeout(resolve, 1200)).then(() => {
                    goHome();
                });
            });
        }
    }, [interp, colors]);

    const backgroundColor =  useAnimatedStyle(() => ({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:  interpolateColor(interp.value, [0, 1], [colorScheme === 'dark' ? 'black' : 'white', endColor ], 'HSV'),
    }), [colors,endColor]);
    return (
        <Animated.View style={backgroundColor}>
            <Image
                source={(Appearance.getColorScheme() === 'dark'  ? splashDark : splash) as ImageSourcePropType}
                width={'100%'}
                resizeMode='contain'
            />
        </Animated.View>
    );

}
function dispatch(arg0: any) {
    throw new Error('Function not implemented.');
}

