
import { Circle, H1, H3, ScrollView, YStack, getTokens } from 'tamagui';
import { Color } from '../types/makerspaceServer';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import Animated,{ useAnimatedProps, interpolate, Extrapolation } from 'react-native-reanimated';
import { useColors } from '../constants/Colors';
import { Platform } from 'react-native';

export default function BlurHeader({ title, children, debouncedPullToRefresh }: { title: string, children?: React.ReactNode, debouncedPullToRefresh?: () => void }) {
    const colors = useColors();
    const [scrollY, setScrollY] = useState(0);
    const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

    useEffect(() => {
        if (debouncedPullToRefresh && scrollY < -170) {
            debouncedPullToRefresh();
        }
    }, [scrollY, debouncedPullToRefresh ]);

    const animatedProps = useAnimatedProps(() => {
        const intensity = interpolate(
            scrollY,
            [0, 50, 70],
            [0, 0, 50],
            Extrapolation.EXTEND,
        );

        if (Platform.OS === 'ios'){
            return {
                intensity,
            };
        } else {
            return { };
        }
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
                    backgroundColor: Platform.OS === 'ios' ? scrollY < 50 ? getTokens().color[colors.background as Color].val : 'transparent' : getTokens().color[colors.background as Color].val ,
                }}
                tint={colors.blurTintColor as 'light' | 'dark'}
                blurReductionFactor={2}
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
                >{title}</H3>
            </AnimatedBlurView>

            <ScrollView
                backgroundColor={colors.background}
                onScroll={(event) => {
                    if (event.nativeEvent.contentOffset.y < 80){
                        setScrollY(event.nativeEvent.contentOffset.y);
                    } else if (scrollY < 80 && scrollY !== 80){
                        setScrollY(80);
                    }
                }}
                overScrollMode='always'
                scrollEventThrottle={30}
            >
                {debouncedPullToRefresh &&
                    <YStack
                        style={{
                            flex: 0,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transform: [
                                { translateY: -140 },
                            ],
                            width: '100%',
                            height: 140,
                            marginBottom:-140,
                        }}
                    >
                        <H3
                            style={{
                                color: colors.text,
                                fontSize: 20,
                                marginTop: 50,
                                fontWeight: '900',
                            }}
                        >Pull to refresh</H3>
                        <Circle
                            size={interpolate(
                                -scrollY,
                                [0, 70, 170],
                                [0, 0, 50],
                                Extrapolation.CLAMP,
                            )}
                            backgroundColor={colors.secondaryAccent.dark}
                        ></Circle>

                    </YStack>
                }

                <YStack
                    backgroundColor={colors.background}
                    style={
                        {
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            minHeight: '100%',
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
                    >{title}</H1>
                    {children}
                </YStack>
            </ScrollView>
        </>
    );
}
