import { ArrowRight } from '@tamagui/lucide-icons';
import TextTicker from 'react-native-text-ticker';
import { XStack, YStack } from 'tamagui';
import { Colors } from '../constants/Colors';
import { Machine } from '../types/machine';
import { SmallMachineBentoBox } from './SmallMachineBentoBox';

export const GridMachineBentoBox = ({ colors, machines, groupName }:{colors:Colors, machines:Machine[], groupName:string}) =>
    <YStack>
        <YStack
        //semi transparent background of following ystack
            style={{ position: 'absolute', bottom: 0, left: 0 }}
            width={'95%'}
            height={'100%'}
            opacity={.1}
            borderRadius={20}
            backgroundColor={colors.accent.dark}
        />
        <YStack
            padding={'$2'}
            paddingTop={'$1'}
            paddingBottom={'$1'}
            aspectRatio={.8}
            borderRadius={20}
            marginRight={'$3'}
        >
            <TextTicker
                style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: colors.text,
                    marginBottom: 5,
                }}
                loop
                duration={7500}
            >{groupName}</TextTicker>
            {/* first row of 2 */}
            <XStack
                flexDirection='row'
                width={'100%'}
                height={'38%'}
                alignItems='flex-start'
                justifyContent='space-between'
            >
                {machines[0] && <SmallMachineBentoBox
                    machine={machines[0]}
                    colors={colors}
                />}
                {machines[1] && <SmallMachineBentoBox
                    machine={machines[1]}
                    colors={colors}
                />}
            </XStack>
            {/* second row of 2 */}
            <XStack
                flexDirection='row'
                width={'100%'}
                height={'38%'}
                alignItems='flex-start'
                justifyContent='space-between'
            >
                {machines[2] && <SmallMachineBentoBox
                    machine={machines[2]}
                    colors={colors}
                />}
                {machines[3] &&
                <>
                    {machines[3] && !machines[4] ? <SmallMachineBentoBox
                        machine={machines[3]}
                        colors={colors}
                    /> : <YStack
                        width={'50%'}
                        height={'100%'}
                        // backgroundColor={'blue'}
                        alignItems='center'
                        justifyContent='center'
                        borderRadius={20}
                        margin={'$0'}
                        marginRight={'$3'}
                    ><ArrowRight color={colors.text} size={'$3'} />
                    </YStack>}
                </>
                }

            </XStack>
        </YStack>

    </YStack>;

