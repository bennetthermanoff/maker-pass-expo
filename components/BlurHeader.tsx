
import { ChevronLeft } from '@tamagui/lucide-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ImageSourcePropType, Platform, RefreshControl } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedProps } from 'react-native-reanimated';
import { getTokens, H1, H3, Image, ScrollView, Text, XStack, YStack } from 'tamagui';
import BannerDark from '../assets/images/banner-dark.png';
import Banner from '../assets/images/banner.png';
import { Color } from '../types/makerspaceServer';
import { parseGroupName } from '../util/parseGroupName';
import { colorSelector } from '../state/slices/makerspacesSlice';
import { useSelector } from 'react-redux';

export default function BlurHeader({ title, subtitle, isHero = false, hasBackButton = false, isTransparent = false, subtitleOnPress, pullToRefresh, refreshing, children }:
    { title: string, subtitle?: string, isHero?: boolean, hasBackButton?: boolean, isTransparent?:boolean, subtitleOnPress?:()=>void, children?: React.ReactNode, pullToRefresh?: () => void | Promise<void>, refreshing?: boolean }) {
    const colors = useSelector(colorSelector);
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
            {hasBackButton &&
            <XStack
                onPress={() => {
                    router.back();
                }}
                style={{
                    position: 'absolute',
                    top: 55,
                    left: 0,
                    zIndex: 2,
                }}
                width={50}
            >
                <ChevronLeft
                    size={40}
                    color={colors.text}
                />
            </XStack>
            }
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
                >{parseGroupName(title)[0]}</H3>
            </AnimatedBlurView>

            <ScrollView
                backgroundColor={isTransparent ? 'transparent' : colors.background}
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
                    backgroundColor={isTransparent ? 'transparent' : colors.background}
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
                    {isHero ?
                        <Image
                            marginTop={'$0'}
                            source={(colors.text === 'white' ? BannerDark : Banner) as ImageSourcePropType}
                            resizeMode='contain'
                            width={'90%'}
                            height={'10%'}
                            style={{
                                opacity: interpolate(
                                    scrollY,
                                    [0, 50, 70],
                                    [1, 0, 0],
                                    Extrapolation.EXTEND,
                                ),
                            }}
                        />
                        :
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
                        >{parseGroupName(title)[0]}</H1>}
                    {parseGroupName(title)[1] && <Text
                        color={colors.text}
                        marginTop={'$-2'}
                        style={{
                            color: colors.text,
                            marginLeft: '3%',
                            opacity: interpolate(
                                scrollY,
                                [0, 50, 70],
                                [.8, 0, 0],
                                Extrapolation.EXTEND,
                            ),

                        }}
                    >{`@${parseGroupName(title)[1]}`}</Text>}
                    {subtitle && <Text
                        color={colors.text}
                        marginTop={isHero ? '$-3' : '$-2'}
                        style={{
                            color: colors.text,
                            fontSize:15,
                            marginLeft: '3%',
                            opacity: interpolate(
                                scrollY,
                                [0, 50, 70],
                                [.8, 0, 0],
                                Extrapolation.EXTEND,
                            ),
                        }}
                        onPress={subtitleOnPress}
                    >{subtitle}</Text>}
                    {children}
                </YStack>
            </ScrollView>
        </>
    );
}
