import { tanStackColors, useAsyncColors, useColors } from '../constants/Colors';
import splash from '../assets/images/splash.png';
import splashDark from '../assets/images/splash-dark.png';
import { useEffect, useState } from 'react';
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import {  Image, getTokens } from 'tamagui';
import { Appearance, ColorSchemeName, ImageSourcePropType } from 'react-native';
import { SplashScreen, router, useLocalSearchParams } from 'expo-router';
import { goHome } from '../util/goHome';
import { Color } from '../types/makerspaceServer';
import { GLOBAL } from '../global';

export default function Splash() {
    const local = useLocalSearchParams();
    const colors = useAsyncColors();
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
