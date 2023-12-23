import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { ColorName, ColorResponse, MakerspaceTheme } from '../types/makerspaceServer';
import { getCurrentTheme } from '../util/makerspaces';
import { getTokens } from 'tamagui';
import { router, useGlobalSearchParams, useRootNavigationState } from 'expo-router';
import  { GLOBAL } from '../global';
const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

const styleSheetColors = {
    light: {
        text: '#000',
        background: '#fff',
        tint: tintColorLight,
        tabIconDefault: '#ccc',
        tabIconSelected: tintColorLight,
    },
    dark: {
        text: '#fff',
        background: '#000',
        tint: tintColorDark,
        tabIconDefault: '#ccc',
        tabIconSelected: tintColorDark,
    },
};
export const useColors = () => {

    const [makerSpaceTheme, setMakerSpaceTheme] = useState<MakerspaceTheme>(GLOBAL.theme as MakerspaceTheme);
    const rootNavigationState = useRootNavigationState();
    const [theme, setTheme] = useState(tanStackColors(makerSpaceTheme.primary,makerSpaceTheme.secondary, Appearance.getColorScheme() === 'dark'));
    Appearance.addChangeListener(({ colorScheme }) => {
        setTheme(tanStackColors(makerSpaceTheme.primary, makerSpaceTheme.secondary, colorScheme === 'dark'));
    });
    useEffect(() => {
        setTheme(tanStackColors(makerSpaceTheme.primary, makerSpaceTheme.secondary, Appearance.getColorScheme() === 'dark'));
        GLOBAL.theme = makerSpaceTheme;
    }, [makerSpaceTheme]);
    useEffect(() => {
        getCurrentTheme().then((theme) => {
            if (theme){
                setMakerSpaceTheme(theme);
            }
        });
    }, []);

    return theme;
};

export const useUnTokenizedColor = (token:string) => {
    const tokens = getTokens();
    return (tokens.color as unknown as Record<string, string>)[token];
};

//https://tamagui.dev/docs/intro/colors
const tanStackColors = (themeBase: ColorName, secondary:ColorName, darkMode:boolean) => (
    {
        background: `$${themeBase}4${darkMode ? 'Dark' : 'Light'}`,
        text: `${darkMode ? 'white' : 'black'}`,
        inverseText: `${darkMode ? 'black' : 'white'}`,
        tint: `$${themeBase}3${darkMode ? 'Dark' : 'Light'}`,
        inputBackground: `$${themeBase}2${darkMode ? 'Dark' : 'Light'}`,
        accent: {
            dark: `$${themeBase}10${darkMode ? 'Light' : 'Dark'}`,
            light: `$${themeBase}3${darkMode ? 'Dark' : 'Light'}`,
        },
        secondaryAccent: {
            dark: `$${secondary}8${darkMode ? 'Light' : 'Dark'}`,
            light: `$${secondary}7${darkMode ? 'Dark' : 'Light'}`,
        },
    }
);

export default styleSheetColors;