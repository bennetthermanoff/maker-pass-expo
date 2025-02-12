import { useEffect, useState } from 'react';
import { ImageSourcePropType } from 'react-native';
import { Image, YStack } from 'tamagui';
import defaultImage from '../assets/images/icon.png';
import { Colors } from '../constants/Colors';
import { Machine } from '../types/machine';
import { getImage } from '../util/machineImageCache';

export const SmallMachineBentoBox = ({ machine, colors, showDisableButton = false }: {machine: Machine, colors: Colors, showDisableButton?: boolean}) => {
    const [image, setImage] = useState<string | null>(null);
    useEffect(() => {
        if (machine.photoHash){
            getImage(machine.photoHash).then((image) => setImage(image));
        }
    }, [machine.photoHash]);

    return (
        <YStack
            height={'100%'}
            aspectRatio={1}
            borderRadius={10}
            padding={'$1'}
            // backgroundColor={colors.accent.light}
        >
            <Image
                resizeMode="cover"
                alignSelf="center"
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 10,
                }}
                zIndex={-1}
                source={image ? { uri:'data:image/png;base64,' + image } : defaultImage as ImageSourcePropType}
            />

        </YStack>

    );
};