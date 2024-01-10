
import { useEffect } from 'react';
import BlurHeader from '../../../components/BlurHeader';
import { Button } from 'tamagui';
import { Wrench } from '@tamagui/lucide-icons';
import { useColors } from '../../../constants/Colors';

export default function Admin() {
    const colors = useColors();
    return (
        <BlurHeader title='Admin Settings'>
            <Button
                marginTop={'$5'}
                spaceFlex
                scaleIcon={2}
                fontSize={'$6'}
                textAlign="left"
                style={buttonStyle}
                iconAfter={Wrench}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
            >Manage Machine Groups</Button>
            <Button
                spaceFlex
                scaleIcon={2}
                fontSize={'$6'}
                textAlign="left"
                style={buttonStyle}
                iconAfter={Wrench}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
            >Manage Permission Groups</Button>
        </BlurHeader>

    );
}

const buttonStyle = {
    margin: '$3',
    height: '$6',
    marginBottom: '$5',

};