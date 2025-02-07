import { Check } from '@tamagui/lucide-icons';
import axios from 'axios';
import { router } from 'expo-router';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, NativeSyntheticEvent, Platform, TextInputChangeEventData, ViewStyle } from 'react-native';
import DropdownSelect from 'react-native-input-select';
import { Button, Input, Text, XStack, YStack, getTokens } from 'tamagui';
import BlurHeader from '../../../components/BlurHeader';
import { useColors } from '../../../constants/Colors';
import { usePermissionGroups } from '../../../hooks/usePermissionGroups';
import { Color, MakerspaceConfig } from '../../../types/makerspaceServer';
import { PermissionObject, User, UserType } from '../../../types/user';
import { getAuthHeaders } from '../../../util/authRoutes';

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
    const debouncedSearch = debounce((search:string,makerspace:MakerspaceConfig) =>
        axios.get(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/user/search/${search.trim()}`, getAuthHeaders(makerspace))
            .then((response) => setUsers(response.data.users))
            .catch((e) => {
                setUsers([]);
            }), 100);
    const searchForUser = (event:NativeSyntheticEvent<TextInputChangeEventData>) => {
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        if (!event.nativeEvent.text){
            return setUsers([]);
        }
        debouncedSearch(event.nativeEvent.text, makerspace);
    };
    const updatePermissions = (user:User) => {
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        // alert(JSON.stringify(user.permissionObject));
        axios.post(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/userPermissions/${user.id}`, user.permissionObject, getAuthHeaders(makerspace))
            .then((response) => {
                alert('Permissions updated successfully!');
                setCloseModal(true);
            })
            .catch((e) => {
            });
    };

    const handleUserTypeChange = (userid:string) => {
        if (makerspace?.user?.userType !== 'admin'){
            return;
        }
        Alert.alert(
            'Change User Type', 'Change user type to:',
            [{
                text: 'Admin',
                onPress: () => changeUserType(userid, 'admin'),
                style: 'destructive',
            },
            {
                text: 'Technician',
                onPress: () => changeUserType(userid, 'technician'),
                style: 'destructive',
            },
            {
                text: 'User',
                onPress: () => changeUserType(userid, 'user'),
            },
            {
                text: 'Cancel',
                onPress: () => {},
                style: 'cancel',
            }],
        );
    };
    const changeUserType = (userid:string, userType:UserType) => {
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        axios.post(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/user/promote/${userid}/${userType}`, {}, getAuthHeaders(makerspace))
            .then((response) => {
                alert('User type updated successfully!');
                searchForUser({ nativeEvent:{ text:'@' } } as NativeSyntheticEvent<TextInputChangeEventData>);
            })
            .catch((e) => {
            });
    };
    const issueOneTimeLogin = (userId:string,userType:string) => {
        if (makerspace?.user?.userType !== 'admin'){
            return;
        }
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        axios.get(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/user/token/${userId}`,  getAuthHeaders(makerspace)).then((response) => {
            const { accessToken }:{accessToken:string} = response.data;
            // router.push(`/home/admin/oneTimeLogin/${accessToken}`, { userid, userType });
            router.push({ pathname:'/oneTimeLogin/[loginToken]', params:{ loginToken:accessToken, userId, userType } });
        }).catch((e) => {
        });
    };
    const deleteUser = (userid:string) => {
        if (makerspace?.user?.userType !== 'admin'){
            return;
        }
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        Alert.alert(
            'Delete User', 'Are you sure you want to delete this user?',
            [{
                text: 'Delete User',
                onPress: () => {
                    axios.delete(`${makerspace?.serverAddress}:${makerspace?.serverPort}/api/user/${userid}`, getAuthHeaders(makerspace))
                        .then((response) => {
                            alert('User deleted successfully!');
                            searchForUser({ nativeEvent:{ text:'@' } } as NativeSyntheticEvent<TextInputChangeEventData>);
                        })
                        .catch((e) => {
                        });
                },
                style: 'destructive',
            },
            {
                text: 'Cancel',
                onPress: () => {},
                style: 'cancel',
            }],
        );
    };
    const longPressUser = (userid:string, userType:string) => {
        if (makerspace?.user?.userType !== 'admin'){
            return;
        }
        Alert.alert(
            'User Options', 'Select an option:',
            [{
                text: 'Issue One Time Login',
                onPress: () => issueOneTimeLogin(userid, userType),
            },
            {
                text: 'Delete User',
                onPress: () => deleteUser(userid),
                style: 'destructive',
            },
            {
                text: 'Cancel',
                onPress: () => {},
                style: 'cancel',
            }],
        );
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
                        changeUserType={handleUserTypeChange}
                        longPressUser={longPressUser}
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

export const UserCard = ({ user, colors, changeUserType, longPressUser, children }: { user:User, colors:ReturnType<typeof useColors>,longPressUser:(userid:string, userType:string)=>void, changeUserType:(userid:string)=>void, children?:React.ReactNode }) =>
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
            <Text
                color={colors.text}
                onLongPress={() => longPressUser(user.id, user.userType)}
            >{user.name}</Text>
            <Text
                onLongPress={() => changeUserType(user.id)}
                alignSelf='flex-end'
                color={colors.text}
            >{user.userType}</Text>
        </XStack>
        <Text color={colors.text}>{user.email}</Text>
        {children}
    </YStack>;
