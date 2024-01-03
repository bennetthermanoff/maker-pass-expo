import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, View, useColorScheme } from 'react-native';

import Colors, { useColors } from '../../constants/Colors';
import { useMakerspace } from '../../util/useMakerspace';
import { YStack, getTokens } from 'tamagui';
import { Color } from '../../types/makerspaceServer';
import { BlurView } from 'expo-blur';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
    const colors = useColors();

    const makerspace = useMakerspace();
    return (

        <Tabs
            screenOptions={{
                tabBarActiveBackgroundColor:getTokens().color[colors.inputBackground as Color].val,
                tabBarInactiveBackgroundColor:getTokens().color[colors.inputBackground as Color].val,
                tabBarActiveTintColor: getTokens().color[colors.secondaryAccent.dark as Color].val,
                tabBarInactiveTintColor: getTokens().color[colors.accent.dark as Color].val,
                tabBarLabelStyle: {
                    fontSize: 15,
                },
                tabBarStyle: {
                    backgroundColor: getTokens().color[colors.inputBackground as Color].val,
                    height: 90,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Machines',
                    tabBarIcon: ({ color }) => <TabBarIcon name='wrench' color={color} />,
                    headerShown: false,

                }}
            />

            <Tabs.Screen
                name="admin/index"
                options={{
                    title: 'Admin',
                    tabBarIcon: ({ color }) => <TabBarIcon name="briefcase" color={color} />,
                    headerShown: false,
                    href: makerspace?.user?.userType === 'admin' ? undefined : null,
                }}

            />

            <Tabs.Screen
                name="train/index"
                options={{
                    title: 'Train',
                    tabBarIcon: ({ color }) => <TabBarIcon name="graduation-cap" color={color} />,
                    headerShown: false,
                    href: makerspace?.user?.userType === 'user' ? null : undefined,
                }}
            />

            <Tabs.Screen
                name="settings/index"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <TabBarIcon name="gears" color={color} />,
                    headerShown: false,
                }}
            />
        </Tabs>

    );
}
