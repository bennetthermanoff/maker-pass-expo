
import { Circle, H1, H3, ScrollView, YStack, getTokens } from 'tamagui';
import { Color } from '../types/makerspaceServer';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import Animated,{ useAnimatedProps, interpolate, Extrapolation } from 'react-native-reanimated';
import { useColors } from '../constants/Colors';
import { Platform, RefreshControl } from 'react-native';

export default function BlurHeader({ title, children, pullToRefresh, refreshing }: { title: string, children?: React.ReactNode, pullToRefresh?: () => void| Promise<void> , refreshing?: boolean}) {
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
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: scrollY <= 0 ? 0 : 1,
                    backgroundColor: scrollY < 50 ? getTokens().color[colors[ Platform.OS === 'android' ? 'blurBackground' : 'background'] as Color].val  : 'transparent',
                }}
                tint={colors.blurTintColor as 'light' | 'dark'}
                blurReductionFactor={1}

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
                overScrollMode='auto'
                scrollEventThrottle={30}
                refreshControl={pullToRefresh && refreshing !== undefined ? <RefreshControl
                    refreshing={refreshing}
                    style={{ zIndex:2, elevation:2  }}
                    onRefresh={pullToRefresh}
                    progressViewOffset={40}
                    progressBackgroundColor={getTokens().color[colors.accent.light as Color].val}
                    tintColor={getTokens().color[colors.secondaryAccent.dark as Color].val}
                    colors={[getTokens().color[colors.secondaryAccent.dark as Color].val]}
                /> : undefined}
            >

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
