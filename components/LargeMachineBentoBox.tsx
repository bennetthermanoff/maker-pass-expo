import { LinearGradient } from '@tamagui/linear-gradient';
import { useEffect, useState } from 'react';
import { ImageSourcePropType } from 'react-native';
import { useSelector } from 'react-redux';
import { Button, H3, Image, YStack } from 'tamagui';
import defaultImage from '../assets/images/icon.png';
import { Colors } from '../constants/Colors';
import { disableMachine } from '../state/slices/machinesSlice';
import { currentServerSelector } from '../state/slices/makerspacesSlice';
import { useAppDispatch } from '../state/store';
import { Machine } from '../types/machine';
import { getImage } from '../util/machineImageCache';

export const LargeMachineBentoBox = ({ machine, colors, showDisableButton = false, onPress }: {machine: Machine, colors: Colors, showDisableButton?: boolean, onPress?:()=>void}) => {
    const [image, setImage] = useState<string | null>(null);
    useEffect(() => {
        if (machine.photoHash){
            getImage(machine.photoHash).then((image) => setImage(image));
        }
    }, [machine.photoHash, machine.photo]);
    const dispatch = useAppDispatch();
    const makerspace = useSelector(currentServerSelector);

    return (
        <YStack
            height={'100%'}
            aspectRatio={1.3}
            borderRadius={20}
            margin={'$0'}
            marginRight={'$3'}
            backgroundColor={colors.accent.light}
            onPress={onPress}
        >
            <Image
                resizeMode="cover"
                alignSelf="center"
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 20,
                }}
                zIndex={-1}
                source={image ? { uri:'data:image/png;base64,' + image } : defaultImage as ImageSourcePropType}
            />
            <LinearGradient
                width={'100%'}
                borderRadius={20}

                colors={colors.text === 'black' ? ['#ffffffff', '#ffffff00'] : ['#000000ff', '#00000000']}
                opacity={1}
                style={{ position: 'absolute', height: '100%' }}
                flexDirection='column'
                justifyContent='space-between'
            >
                <H3
                    marginTop={'$3'}
                    marginLeft={'$3'}
                    marginRight={'$3'}
                    color={colors.text}
                    fontSize={22}
                    maxHeight={showDisableButton ? '55%' : '100%'}
                    lineHeight={22}
                >{machine?.name}</H3>
                <Button
                    marginBottom={'$2'}
                    alignSelf='center'
                    width={'94%'}
                    height={'25%'}
                    color={'black'}
                    backgroundColor={'$red8'}
                    opacity={.9}
                    borderRadius={20}
                    onPress={() => {
                        if (makerspace){
                            dispatch(disableMachine({ machineId:machine.id,makerspace }));
                        }
                    }}
                    display={showDisableButton ? 'flex' : 'none'}
                >Disable</Button>
            </LinearGradient>

        </YStack>

    );
};
