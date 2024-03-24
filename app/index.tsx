import { useColors } from '../constants/Colors';
import splash from '../assets/images/splash.png';
import splashDark from '../assets/images/splash-dark.png';
import { useEffect, useState } from 'react';
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import {  Image, getTokens } from 'tamagui';
import { ImageSourcePropType } from 'react-native';
import { SplashScreen, router, useLocalSearchParams } from 'expo-router';
import { goHome } from '../util/goHome';
import { Color } from '../types/makerspaceServer';

export default function Splash() {
    const local = useLocalSearchParams();
    const colors = useColors();
    const [endColor, setEndColor] = useState<string>('black');
    const [once, setOnce] = useState(false);
    const interp  = useSharedValue(0);
    useEffect(() => {
        if (colors.background){
            if (once){
                return;
            }
            setOnce(true);
            new Promise((resolve) => setTimeout(resolve, 300)).then(() => {
                SplashScreen.hideAsync();
                interp.value = withTiming(1, { duration: 1200 });
                new Promise((resolve) => setTimeout(resolve, 1200)).then(() => {
                    goHome();
                });
            });
        }
    }, [interp, colors]);

    useEffect(() => {
        if (colors.background){
            setEndColor(getTokens().color[colors.background as Color].val);
        }
    }, [colors]);

    const backgroundColor = useAnimatedStyle(() => ({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:  interpolateColor(interp.value, [0, 1], [colors.inverseText, endColor ], 'HSV'),
    }), [colors]);
    return (
        <Animated.View style={backgroundColor}>
            <Image
                source={(colors.inverseText === 'white' ? splash : splashDark) as ImageSourcePropType}
                width={'100%'}
                resizeMode='contain'
            />
        </Animated.View>
    );

}
