import { useState } from 'react';
import { Appearance } from 'react-native';

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
    const [theme, setTheme] = useState(tanStackColors('green','blue', Appearance.getColorScheme() === 'dark'));
    Appearance.addChangeListener(({ colorScheme }) => {
        setTheme(tanStackColors('green', 'blue', colorScheme === 'dark'));
    });
    return theme;
};
//https://tamagui.dev/docs/intro/colors
const tanStackColors = (themeBase: string, secondary:string, darkMode:boolean) => ({
    background:`$${themeBase}4${darkMode ? 'Dark' : 'Light'}`,
    text:`${darkMode ? 'white' : 'black'}`,
    inverseText:`${darkMode ? 'black' : 'white'}`,
    tint:`$${themeBase}3${darkMode ? 'Dark' : 'Light'}`,
    accent:{
        dark:`$${themeBase}10${darkMode ? 'Light' : 'Dark'}`,
        light:`$${themeBase}3${darkMode ? 'Dark' : 'Light'}`,
    },
    secondaryAccent:{
        dark:`$${secondary}8${darkMode ? 'Light' : 'Dark'}`,
        light:`$${secondary}7${darkMode ? 'Dark' : 'Light'}`,
    },
});

export default styleSheetColors;