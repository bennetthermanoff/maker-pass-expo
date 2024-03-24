
import { useEffect } from 'react';
import BlurHeader from '../../../components/BlurHeader';
import { Button } from 'tamagui';
import { Wrench } from '@tamagui/lucide-icons';
import { useColors } from '../../../constants/Colors';
import { router } from 'expo-router';

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
                onPress={() => {router.push('/machineGroups/');}}
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
                onPress={() => {router.push('/permissionGroups/');}}
            >Manage Permission Groups</Button>
            <Button
                spaceFlex
                scaleIcon={2}
                fontSize={'$6'}
                textAlign="left"
                style={buttonStyle}
                iconAfter={Wrench}
                backgroundColor={colors.secondaryAccent.light}
                color={colors.text}
                onPress={() => {router.push('/addMachine/new');}}
            >Add Machine</Button>
        </BlurHeader>

    );
}

const buttonStyle = {
    margin: '$3',
    height: '$6',
    marginBottom: '$5',

};