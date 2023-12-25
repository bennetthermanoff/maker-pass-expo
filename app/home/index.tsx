
import { H1, H3, ScrollView, YStack, getTokens } from 'tamagui';
import { useColors } from '../../constants/Colors';
import { Color } from '../../types/makerspaceServer';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import Animated,{ useAnimatedProps, interpolate, Extrapolation } from 'react-native-reanimated';

export default function Machines() {
    const colors = useColors();
    const [scrollY, setScrollY] = useState(0);
    const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

    const animatedProps = useAnimatedProps(() => {
        const intensity = interpolate(
            scrollY,
            [0, 50, 70],
            [0, 0, 50],
            Extrapolation.EXTEND,
        );

        return {
            intensity,
        };
    });

    return (
        <>
            <AnimatedBlurView
                animatedProps={animatedProps}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    height: 100,
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: scrollY < 50 ? getTokens().color[colors.background as Color].val : 'transparent',
                }}
                tint={colors.blurTintColor as 'light' | 'dark'}
            >
                <H3
                    style={{
                        color: colors.text,
                        fontSize: 20,
                        marginTop: 50,
                        fontWeight: '900',
                        opacity: interpolate(
                            scrollY,
                            [0, 50, 70],
                            [0, 0, 1],
                            Extrapolation.EXTEND,
                        ),
                    }}
                >{'Machines'}</H3>
            </AnimatedBlurView>
            <ScrollView
                backgroundColor={colors.background}
                onScroll={(event) => {
                    setScrollY(event.nativeEvent.contentOffset.y);
                }}
                scrollEventThrottle={65}
            >

                <YStack
                    backgroundColor={colors.background}
                    style={
                        {
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            height: 1500,
                            paddingTop: 100,
                        }
                    }
                >

                    <H1
                        style={{
                            color: colors.text,
                            marginLeft: '3%',
                            fontSize: 40,
                            fontWeight: '900',
                            opacity: interpolate(
                                scrollY,
                                [0, 50, 70],
                                [1, 0, 0],
                                Extrapolation.EXTEND,
                            ),

                        }}
                    >Machines</H1>
                </YStack>
            </ScrollView>
        </>
    );
}
