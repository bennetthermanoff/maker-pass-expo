import { Input, YStack, Text, XStack, getTokens, Button } from 'tamagui';
import BlurHeader from '../../../components/BlurHeader';
import React, { useEffect, useState } from 'react';
import { PermissionObject, User } from '../../../types/user';
import { useColors } from '../../../constants/Colors';
import { getAuthHeaders } from '../../../util/authRoutes';
import axios from 'axios';
import { KeyboardAvoidingView, NativeSyntheticEvent, Platform, TextInputChangeEventData, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import DropdownSelect from 'react-native-input-select';
import { Color } from '../../../types/makerspaceServer';
import { useMachines } from '../../../hooks/useMachines';
import { usePermissionGroups } from '../../../hooks/usePermissionGroups';
import { Check } from '@tamagui/lucide-icons';

export default function SearchUser() {
    const [users, setUsers] = useState<User[]>([]);
    const [closeModal, setCloseModal] = useState(false);
    const colors = useColors();
    const { permissionGroups, machines, makerspace } = usePermissionGroups();
    const [permissions, setPermissions] = useState<{machines:Array<{id:string, name:string}>, permissionGroups:Array<{id:string, name:string}>}>({ machines:[], permissionGroups:[] });

    useEffect(() => {
        if (permissionGroups && machines){
            setPermissions({ machines: machines.map((machine) => ({ id:machine.id, name:machine.name })), permissionGroups: permissionGroups.map((permissionGroup) => ({ id:permissionGroup.id, name:permissionGroup.name })) });
        }
    }, [permissionGroups, machines]);

    useEffect(() => {
        if (makerspace?.id){
            searchForUser({ nativeEvent:{ text:'@' } } as NativeSyntheticEvent<TextInputChangeEventData>);
        }
    }, [makerspace?.id]);

    useEffect(() => {
        if (closeModal){
            new Promise((resolve) => setTimeout(resolve, 50)).then(() => {setCloseModal(false);});
        }
    }, [closeModal]);

    const searchForUser = (text:NativeSyntheticEvent<TextInputChangeEventData>) => {
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        if (!text.nativeEvent.text){
            return setUsers([]);
        }
        axios.get(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/user/search/${text.nativeEvent.text}`, getAuthHeaders(makerspace))
            .then((response) => setUsers(response.data.users))
            .catch((error) => {
                alert(error);
                setUsers([]);
            });

    };
    const updatePermissions = (user:User) => {
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        axios.post(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/userPermissions/${user.id}`, user.permissionObject, getAuthHeaders(makerspace))
            .then((response) => {
                alert('Permissions updated successfully!');
                setCloseModal(true);
            })
            .catch((error) => {
                alert(JSON.stringify(error.response.data));
            });
    };

    return (
        <KeyboardAvoidingView
            style={{ backgroundColor:getTokens().color[colors.background as Color].val , minHeight:'100%' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
            <BlurHeader title="Train User">
                <YStack
                    style={{ flex: 1, alignItems: 'center' }}
                >
                    <Input
                        placeholder={'Search for a user'}
                        width={'95%'}
                        backgroundColor={colors.inputBackground}
                        color={colors.text}
                        onChange={searchForUser}
                    />
                    {users.map((user) => <UserCard
                        user={user}
                        colors={colors}
                        key={user.id}
                        children={<DropdownSelect
                            isMultiple
                            isSearchable
                            hideModal={closeModal}
                            dropdownStyle={{
                                backgroundColor: getTokens().color[colors.inputBackground as Color].val,
                                borderColor: getTokens().color[colors.inputBackground as Color].val,
                                shadowColor: getTokens().color[colors.inputBackground as Color].val,
                                width: '99%',
                                alignSelf: 'center',
                                marginTop: 5,
                                marginBottom: -20,
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
                                sectionHeaderStyle: {
                                    color: colors.text,
                                },
                            }}
                            placeholder='Edit Trainings'
                            options={[
                                {
                                    title: 'Groups',
                                    data: permissions.permissionGroups.map((permissionGroup) => ({ label:permissionGroup.name, value:permissionGroup.id })),
                                },
                                {
                                    title: 'Machines',
                                    data: permissions.machines.map((machine) => ({ label:machine.name, value:machine.id })),
                                },
                            ]}
                            listHeaderComponent={
                                <Button
                                    iconAfter={Check}
                                    scaleIcon={1.5}
                                    fontSize={'$5'}
                                    textAlign="left"
                                    color={colors.text}
                                    backgroundColor={colors.accent.dark}
                                    width={'95%'}
                                    alignSelf='center'
                                    margin={'$1'}
                                    onPress={() => {
                                        setCloseModal(true);
                                        updatePermissions(user);
                                    }}
                                >Save</Button>
                            }
                            listControls={{ hideSelectAll:true }}
                            selectedValue={user.permissionObject.groups.map((group) => group.id).concat(user.permissionObject.machines.map((machine) => machine.id))}
                            onValueChange={(enabledIds:string[]) => {
                                const machineIds = enabledIds.filter((id) => permissions.machines.map((machine) => machine.id).includes(id));
                                const groupIds = enabledIds.filter((id) => permissions.permissionGroups.map((group) => group.id).includes(id));
                                const permissionObject:PermissionObject = { machines:machineIds.map((id) => ({ id, permission:true })), groups:groupIds.map((id) => ({ id, permission:true })) };
                                setUsers(users.map((user_) => {
                                    if (user_.id === user.id){
                                        return { ...user, permissionObject };
                                    } else {
                                        return user_;
                                    }}));
                            }
                            }
                        />}
                    />)}
                    {users.length === 0 && <Text margin={'$3'} color={colors.text}>No users found.</Text>}
                    {users.length >= 10 && <Text margin={'$0'} fontSize={'$9'} marginTop={'$-4'} color={colors.text}>...</Text>}
                </YStack>

            </BlurHeader>
        </KeyboardAvoidingView>
    );
}

export const UserCard = ({ user, colors, children }: { user:User, colors:ReturnType<typeof useColors>, children?:React.ReactNode }) =>
    <YStack
        backgroundColor={colors.accent.dark}
        padding={'$2'}
        margin={'$2'}
        borderRadius={'$2'}
        width={'95%'}
    >
        <XStack
            alignItems={'center'}
            justifyContent={'space-between'}
        >
            <Text color={colors.text}>{user.name}</Text>
            <Text
                alignSelf='flex-end'
                color={colors.text}
            >{user.userType}</Text>
        </XStack>
        <Text color={colors.text}>{user.email}</Text>
        {children}
    </YStack>;
