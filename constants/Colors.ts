import { getTokens } from 'tamagui';
import { ColorName } from '../types/makerspaceServer';
const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

const styleSheetColors = {
    light: {
        text: '#000',
        background: '#fff',
        tint: tintColorLight,
        tabIconDefault: '#ccc',
        tabIconSelected: tintColorLight,
        blurTint:'light',
    },
    dark: {
        text: '#fff',
        background: '#000',
        tint: tintColorDark,
        tabIconDefault: '#ccc',
        tabIconSelected: tintColorDark,
        blurTint:'dark',
    },
};

export type Colors = {
    background: string,
    text: string,
    subText?: string,
    inverseText: string,
    tint: string,
    inputBackground: string,
    accent: {
        dark: string,
        light: string,
    },
    blurBackground: string,
    secondaryAccent: {
        dark: string,
        light: string,
    },
    blurTintColor: 'dark'|'light',
};

export const useUnTokenizedColor = (token:string) => {
    const tokens = getTokens();
    return (tokens.color as unknown as Record<string, string>)[token];
};

//https://tamagui.dev/docs/intro/colors
export const tanStackColors = (themeBase: ColorName, secondary:ColorName, darkMode:boolean) => (
    {
        background: `$${themeBase}4${darkMode ? 'Dark' : 'Light'}`,
        text: `${darkMode ? 'white' : 'black'}`,
        subText: darkMode ? 'rgba(178, 178, 178, 1)' : 'rgba(77, 77, 77, 1)',
        inverseText: `${darkMode ? 'black' : 'white'}`,
        tint: `$${themeBase}3${darkMode ? 'Dark' : 'Light'}`,
        inputBackground: `$${themeBase}2${darkMode ? 'Dark' : 'Light'}`,
        accent: {
            dark: `$${themeBase}10${darkMode ? 'Light' : 'Dark'}`,
            light: `$${themeBase}3${darkMode ? 'Dark' : 'Light'}`,
        },
        blurBackground:`$${themeBase}5${darkMode ? 'Dark' : 'Light'}`,
        secondaryAccent: {
            dark: `$${secondary}8${darkMode ? 'Light' : 'Dark'}`,
            light: `$${secondary}7${darkMode ? 'Dark' : 'Light'}`,
        },
        blurTintColor: `${darkMode ? 'dark' : 'light'}`,

    }
) as Colors;

export default styleSheetColors;