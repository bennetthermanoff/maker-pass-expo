import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '../../constants/Colors';
import { MachineGroupBody, PermissionGroup } from '../../types/machine';
import { useState } from 'react';
import BlurHeader from '../../components/BlurHeader';
import { Button, H3, H4, Input, Label, Section, Spacer, Switch, Text, XStack, YStack, getTokens } from 'tamagui';
import DropdownSelect from 'react-native-input-select';
import { Color } from '../../types/makerspaceServer';
import { useMachines } from '../../hooks/useMachines';
import { CancelButton } from '../../components/CancelButton';
import { Minus, Plus } from '@tamagui/lucide-icons';
import { KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';
import axios from 'axios';
import { getAuthHeaders } from '../../util/authRoutes';
import { GLOBAL } from '../../global';

export default function EditPermissionGroup(){
    const local = useLocalSearchParams();
    const colors = useColors();
    const { machines, loading, makerspace } = useMachines();
    const getPermissionGroupInitialData = () => {
        if (local.groupId === 'new'){
            return { name:'',machineIds:[] };
        } else {
            const permissionGroup = JSON.parse(local.permissionGroup as string) as PermissionGroup;
            return permissionGroup;
        }
    };

    const [formData, setFormData] = useState<Partial<PermissionGroup>>(getPermissionGroupInitialData());

    const machineDropDownSelectedText = () => {
        if (formData.machineIds?.length === 0){
            return 'Select an option';
        } else if (formData.machineIds?.length === 1){
            return `${formData.machineIds[0]}`;
        } else {
            return `${formData.machineIds?.length} machines selected`;
        }
    };

    const handleSubmit = async () => {
        if (local.groupId === 'new'){
            handleNewPermissionGroup();
        }
        else {
            handleEditPermissionGroup();
        }
    };
    const handleNewPermissionGroup = async () => {
        if (!formData.name){
            return alert('Please enter a machine name.');
        }
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        try {
            const response = await axios.post(
                `${makerspace?.serverAddress}:${makerspace?.serverPort}/api/permissionGroup/single/`,
                {
                    name:formData.name,
                    machineIds:formData.machineIds,
                },
                getAuthHeaders(makerspace),
            );
            router.back();
            alert('Permission group added successfully!');
        } catch (e:any) {
        }
    };
    const handleEditPermissionGroup = async () => {
        if (formData.name && formData.name === ''){
            return alert('Please enter a machine name.');
        }
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        try {
            const response = await axios.patch(
                `${makerspace?.serverAddress}:${makerspace?.serverPort}/api/permissionGroup/single/${local.groupId}`,
                {
                    name:formData.name,
                    machineIds:formData.machineIds,
                },
                getAuthHeaders(makerspace),
            );
            router.back();
            alert('Permission group updated successfully!');
        } catch (e:any) {
            alert(JSON.stringify(e.response.data));
        }
    };
    const deletePermissionGroup = async () => {
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        try {
            const response = await axios.delete(
                `${makerspace?.serverAddress}:${makerspace?.serverPort}/api/permissionGroup/single/${local.groupId}`,
                getAuthHeaders(makerspace),
            );
            router.back();
            alert('Permission group deleted successfully!');
        } catch (e:any) {
            alert(JSON.stringify(e.response.data));
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ backgroundColor:getTokens().color[colors.background as Color].val , minHeight:'100%' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
            <BlurHeader title={local.groupId === 'new' ? 'Add Permission Group' : 'Edit Permission Group'}>
                <YStack
                    width={'100%'}
                    alignItems='center'

                >

                    <Input
                        placeholder="Group Name"
                        value={formData.name}
                        onChangeText={(name:string) => setFormData({ ...formData, name })}
                        keyboardType="default"
                        returnKeyType="next"
                        backgroundColor={colors.inputBackground}
                        color={colors.text}
                        marginTop={'$4'}
                        width={'95%'}
                    />
                    <DropdownSelect
                        label={'Machines'}
                        isMultiple
                        isSearchable
                        labelStyle={{ color: colors.text, margin: 12, marginBottom:3 }}
                        dropdownStyle={{
                            backgroundColor: getTokens().color[colors.inputBackground as Color].val,
                            borderColor: getTokens().color[colors.inputBackground as Color].val,
                            shadowColor: getTokens().color[colors.inputBackground as Color].val,
                            width: '95%',
                            alignSelf: 'center',
                        }}
                        dropdownIconStyle={{ backgroundColor: getTokens().color[colors.accent.dark as Color].val ,
                            padding: 10,
                            margin: -10,
                            borderRadius: 10,
                            borderColor: getTokens().color[colors.accent.light as Color].val,
                            borderWidth: 1,
                        }}
                        selectedItemStyle={{ color: colors.text }}
                        modalOptionsContainerStyle={{
                            backgroundColor: getTokens().color[colors.background as Color].val,
                            height:'100%',
                        }}
                        searchInputStyle={{
                            backgroundColor:getTokens().color[colors.inputBackground as Color].val,
                            color:colors.text,
                        } as ViewStyle}
                        checkboxLabelStyle={{ color: colors.text }}
                        placeholderStyle={{ color: colors.text }}
                        primaryColor={getTokens().color[colors.accent.dark as Color].val}
                        listComponentStyles={{
                            itemSeparatorStyle: {
                                borderColor: getTokens().color[colors.secondaryAccent.light as Color].val,
                                backgroundColor: getTokens().color[colors.secondaryAccent.light as Color].val,
                            },
                        }}
                        placeholder='Select an option'
                        options={machines.map((machine) => ({
                            label:`${machine.name}`, value:machine.id,
                        }))}
                        selectedValue={formData.machineIds}
                        onValueChange={(enabledIds:string[]) => {
                            setFormData({ ...formData, machineIds: enabledIds });
                        }}
                    />

                    <Section
                        borderWidth={1}
                        marginTop={'$3'}
                        width={'95%'}
                        opacity={.2}
                        borderColor={colors.text}
                    />
                    <Button
                        color={colors.text}
                        backgroundColor={colors.accent.dark}
                        width={'95%'}
                        marginTop={'$3'}
                        marginBottom={local.groupId === 'new' ? 100 : 20}
                        onPress={handleSubmit}
                    >{local.groupId === 'new' ? 'Add Permission Group' : 'Update Permission Group'}</Button>
                    {local.groupId !== 'new' ?
                        <Button
                            color={colors.text}
                            backgroundColor={colors.secondaryAccent.light}
                            width={'auto'}
                            marginTop={'$3'}
                            marginBottom={100}
                            onPress={deletePermissionGroup}
                        >Delete Permission Group</Button>
                        : null}
                </YStack>
            </BlurHeader>
            <CancelButton colors={colors} />
        </KeyboardAvoidingView>
    );
}