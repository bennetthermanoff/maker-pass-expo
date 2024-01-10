import { useState } from 'react';
import { useColors } from '../../constants/Colors';
import { Machine } from '../../types/machine';
import { useMakerspace } from '../../util/useMakerspace';
import { Button, H4, Input, Label, Switch, XStack, YStack } from 'tamagui';
import { Image, Plus } from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import BlurHeader from '../../components/BlurHeader';
import { getAuthHeaders } from '../../util/authRoutes';
import { GLOBAL } from '../../global';

export default function AddMachine() {
    const local = useLocalSearchParams();
    const colors = useColors();
    const makerspace = useMakerspace();

    const getMachineInitialData = () => {
        if (local.machineId === 'new'){
            return { machine:{
                solenoidMode: false,
            },
            requireEnableKey: true };}
        else {
            const machine = JSON.parse(local.machine as string);
            return {
                machine: { ...machine, solenoidMode:machine.solenoidMode ? true : false },
                requireEnableKey: machine ? true : false,
            };
        }
    };

    const [formData, setFormData] = useState<{machine:Partial<Machine>, requireEnableKey:boolean}>(getMachineInitialData());

    const handleSubmit = async () => {
        if (local.machineId === 'new'){
            handleNewMachine();
        }
        else {
            handleEditMachine();
        }
    };

    const handleNewMachine = async () => {
        if (!formData.machine.name) {
            return alert('Please enter a machine name.');
        }
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        try {
            const response = await axios.post(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/machine/single`, {
                machine: formData.machine,
                requireEnableKey: formData.requireEnableKey,
            }, getAuthHeaders(makerspace));
            router.back();
            alert('Machine added successfully!');
            GLOBAL.getMachines();

        }
        catch (e:any) {
            alert(JSON.stringify(e.response.data));
        }
    };

    const handleEditMachine = async () => {
        if (!formData.machine.name) {
            return alert('Please enter a machine name.');
        }
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        try {
            const response = await axios.patch(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/machine/single/${local.machineId}`, {
                machine: formData.machine,
                requireEnableKey: formData.requireEnableKey,
            }, getAuthHeaders(makerspace));
            router.back();
            alert('Machine updated successfully!');
            setTimeout(() => {
                GLOBAL.getMachines();
            }, 200);

        }
        catch (e:any) {
            alert(JSON.stringify(e.response.data));
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
            allowsEditing: true,
            aspect: [ 2, 1 ],
            base64: true,

        });
        if (result.assets?.[0]?.base64){
            const base64 = result.assets[0].base64;
            setFormData({ ...formData, machine:{ ...formData.machine, photo:base64 } });

        }

    };

    return (
        <BlurHeader title={local.machineId === 'new' ? 'Add Machine' : 'Edit Machine'}>
            <YStack
                width={'100%'}
                alignItems='center'
            >
                <Input
                    placeholder="Machine Name"
                    value={formData.machine.name}
                    onChangeText={(name) => setFormData({ ...formData, machine:{ ...formData.machine, name } })}
                    keyboardType="default"
                    returnKeyType="next"
                    backgroundColor={colors.inputBackground}
                    color={colors.text}
                    marginTop={'$4'}
                    width={'95%'}

                />
                <Input
                    placeholder="MQTT Topic"
                    value={formData.machine.mqttTopic as string}
                    onChangeText={(mqttTopic) => setFormData({ ...formData, machine:{ ...formData.machine, mqttTopic } })}
                    keyboardType="default"
                    returnKeyType="next"
                    autoCapitalize="none"
                    backgroundColor={colors.inputBackground}
                    color={colors.text}
                    marginTop={'$4'}
                    width={'95%'}
                />
                <XStack
                    width={'95%'}
                >
                    <H4
                        color={colors.text}
                        marginTop={'$3.5'}
                    >Require Enable Key
                    </H4>
                    <Switch
                        checked={formData.requireEnableKey}
                        onCheckedChange={(requireEnableKey) => setFormData({ ...formData, requireEnableKey })}
                        value="Require Enable Key"
                        defaultChecked={true}
                        marginTop={'$4'}
                        marginLeft={'$4'}
                        backgroundColor={formData.requireEnableKey ? colors.accent.dark : colors.accent.light}
                    >
                        <Switch.Thumb animation="bouncy" />
                    </Switch>

                </XStack>
                <Label
                    flexWrap='wrap'
                    color={colors.text}
                    width={'95%'}
                    lineHeight={'$2'}

                >A unique key will be generated for unlocking your machine, for use with encrypted RFID cards.</Label>
                <XStack
                    width={'95%'}

                >
                    <H4
                        color={colors.text}
                        marginTop={'$3.5'}
                    >Solenoid Mode</H4>
                    <Switch
                        checked={formData.machine.solenoidMode}
                        onCheckedChange={(solenoidMode) => setFormData({ ...formData, machine:{ ...formData.machine, solenoidMode } })}
                        value="Solenoid Mode"
                        defaultChecked={false}
                        marginTop={'$4'}
                        marginLeft={'$4'}
                        backgroundColor={formData.machine.solenoidMode ? colors.accent.dark : colors.accent.light}
                    >
                        <Switch.Thumb animation="bouncy" />
                    </Switch>
                </XStack>
                <Label
                    flexWrap='wrap'
                    color={colors.text}
                    lineHeight={'$2'}
                    width={'95%'}
                    marginBottom={'$8'}
                >Solenoid mode will disable the machine after a set amount of time, great for KeyBoxes, and logging machine use on uncontrolled machines.</Label>

                <Button
                    iconAfter={formData.machine?.photo ? Image : Plus}
                    scaleIcon={1.5}
                    fontSize={'$5'}
                    textAlign="left"
                    color={colors.text}
                    backgroundColor={colors.accent.light}
                    width={'95%'}
                    onPress={pickImage}
                >{formData.machine?.photo ? 'Change Photo' : 'Add Photo'}</Button>
                <Button
                    color={colors.text}
                    backgroundColor={colors.accent.dark}
                    width={'95%'}
                    marginTop={'$4'}
                    onPress={handleSubmit}
                >{local.machineId === 'new' ? 'Add Machine' : 'Update Machine'}</Button>
            </YStack>
            <YStack
                width={'100%'}
                alignItems='center'
                flexDirection='column-reverse'
                flex={1}
            >
                <Button
                    backgroundColor={colors.secondaryAccent.light}
                    color={colors.text}
                    width={'35%'}
                    onPress={() => {
                        router.back();
                    }}
                    marginBottom={'$7'}
                >Cancel</Button>
            </YStack>
        </BlurHeader>
    );
}