
import { YStack } from 'tamagui';
import { useColors } from '../../constants/Colors';

export default function Machines() {
    const colors = useColors();
    return (
        <YStack
            backgroundColor={colors.background}
            style={
                {
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                }
            }
        >
        </YStack>
    );
}
