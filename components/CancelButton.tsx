import { Button, YStack } from 'tamagui';
import { Colors } from '../constants/Colors';
import { router } from 'expo-router';

export const CancelButton = (props:{colors:Colors}) =>
    <YStack
        width={'100%'}
        alignItems='center'
        flexDirection='column-reverse'
        position='absolute'
        bottom={0}
        flex={1}
    >

        <Button
            backgroundColor={props.colors.secondaryAccent.light}
            color={props.colors.text}
            width={'35%'}
            borderColor={props.colors.tint}
            onPress={() => {
                router.back();
            }}
            marginBottom={'$7'}
        >Cancel</Button>
    </YStack>;