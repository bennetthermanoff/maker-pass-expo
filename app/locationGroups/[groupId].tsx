import { Minus, Plus } from '@tamagui/lucide-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';
import DropdownSelect from 'react-native-input-select';
import { useSelector } from 'react-redux';
import { Button, H3, H4, Input, Section, Switch, Text, XStack, YStack, getTokens } from 'tamagui';
import BlurHeader from '../../components/BlurHeader';
import { useColors } from '../../constants/Colors';
import { fetchLocationGroups, selectLocationGroups, selectMachineGroupAsArray } from '../../state/slices/machinesSlice';
import { currentServerSelector } from '../../state/slices/makerspacesSlice';
import { useAppDispatch } from '../../state/store';
import { LocationGroupBody } from '../../types/machine';
import { Color } from '../../types/makerspaceServer';
import { getAuthHeaders } from '../../util/authRoutes';

export default function EditLocationGroup(){
    const local = useLocalSearchParams();
    const colors = useColors();
    const machineGroups = useSelector(selectMachineGroupAsArray);
    const makerspace = useSelector(currentServerSelector);
    const locationGroup = useSelector(selectLocationGroups)[local.groupId as string];
    const dispatch = useAppDispatch();
    const getLocationGroupInitialData = () => {
        if (local.groupId !== 'new'){
            return locationGroup;
        } else {
            return {
                name:'',
                groups:[],
                geoFences:[],
            };
        }
    };

    const [formData, setFormData] = useState<Partial<LocationGroupBody>>(getLocationGroupInitialData());

    const [enableGeoFence, setEnableGeoFence] = useState<boolean>(() => {
        const geoFences = formData.geoFences;
        if (geoFences){
            return geoFences.length > 1;
        } else {
            return false;
        }
    });

    const handleAddLocation = async () => {
        const geoFences = formData.geoFences ? formData.geoFences : [];
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted'){
            alert('Permission to access location was denied');
            return;
        }
        const location = await Location.getCurrentPositionAsync({});
        geoFences.push({ lat:location.coords.latitude,lng:location.coords.longitude,radius:0 });
        setFormData({ ...formData, geoFences });
    };

    const groupDropDownSelectedText = () => {
        if (formData.groups?.length === 0){
            return 'Select an option';
        } else if (formData.groups?.length === 1){
            return `${formData.groups[0]}`;
        } else {
            return `${formData.groups?.length} groups selected`;
        }
    };

    const handleSubmit = async () => {
        if (local.groupId === 'new'){
            handleNewLocationGroup();
        }
        else {
            handleEditLocationGroup();
        }
    };
    const handleNewLocationGroup = async () => {
        if (!formData.name){
            return alert('Please enter a location group name.');
        }
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        const response = await axios.post(
            `${makerspace?.serverAddress}:${makerspace?.serverPort}/api/locationGroups/single/`,
            {
                name:formData.name,
                groups:formData.groups,
                geoFences:formData.geoFences,
            },
            getAuthHeaders(makerspace),
        );
        router.back();
        alert('Location group added successfully!');
        dispatch(fetchLocationGroups(makerspace));
    };
    const handleEditLocationGroup = async () => {
        if (formData.name && formData.name === ''){
            return alert('Please enter a location group name.');
        }
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        const response = await axios.patch(
            `${makerspace?.serverAddress}:${makerspace?.serverPort}/api/locationGroups/single/${local.groupId}`,
            {
                name:formData.name,
                groups:formData.groups,
                geoFences:formData.geoFences,
            },
            getAuthHeaders(makerspace),
        );
        router.back();
        alert('Location group updated successfully!');
        dispatch(fetchLocationGroups(makerspace));
    };
    const deleteLocationGroup = async () => {
        if (!makerspace?.serverAddress || !makerspace?.serverPort){
            return alert('Unknown Makerspace.');
        }
        const response = await axios.delete(
            `${makerspace?.serverAddress}:${makerspace?.serverPort}/api/locationGroups/single/${local.groupId}`,
            getAuthHeaders(makerspace),
        );
        router.back();
        alert('Location group deleted successfully!');
        dispatch(fetchLocationGroups(makerspace));
    };
    const handleDeleteGeoFence = (index:number) => {
        Alert.alert('Delete GeoFence','Are you sure you want to delete this GeoFence?',[
            {
                text:'Delete',
                onPress:() => {
                    const geoFences = formData.geoFences;
                    if (geoFences){
                        geoFences.splice(index,1);
                        setFormData({ ...formData, geoFences });
                    }
                },
            },
            {
                text:'Cancel',
                style:'cancel',
            },
        ]);
    };

    return (
        <KeyboardAvoidingView
            style={{ backgroundColor:getTokens().color[colors.background as Color].val , minHeight:'100%' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
            <BlurHeader hasBackButton title={local.groupId === 'new' ? 'Add Location Group' : 'Edit Location Group'}>
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
                    <Text
                        color={colors.text}
                        marginTop={'$1'}
                        padding={'$0'}
                        fontSize={'$2'}
                        flexWrap='wrap'
                        width={'90%'}
                    >Tip: add a location for your location groups with parenthesis</Text>
                    <DropdownSelect
                        label={'Groups'}
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
                        options={machineGroups.map((machineGroup) => ({
                            label:`${machineGroup.name}`, value:machineGroup.id,
                        }))}
                        selectedValue={formData.groups}
                        onValueChange={(enabledIds:string[]) => {
                            setFormData({ ...formData, groups: enabledIds });
                        }}
                    />
                    <Text
                        color={colors.text}
                        fontSize={'$2'}
                        marginTop={'$-4'}
                        flexWrap='wrap'
                        width={'90%'}
                    >*Selecting a group already in a location group will remove that group from other location groups.</Text>
                    <YStack
                        backgroundColor={colors.inputBackground}
                        width={'95%'}
                        borderRadius={10}
                        padding={'$2'}
                        marginTop={'$2.5'}
                        alignItems='center'
                    >
                        <XStack
                            width={'95%'}
                        >
                            <H4
                                color={colors.text}

                            >Enable GeoFence
                            </H4>
                            <Switch
                                checked={enableGeoFence}
                                onCheckedChange={(enableGeoFence) => {setEnableGeoFence(enableGeoFence); setFormData({ ...formData, geoFences:[] });}}
                                value="Enable GeoFence"

                                marginLeft={'$4'}
                                backgroundColor={enableGeoFence ? colors.accent.dark : colors.accent.light}
                            ><Switch.Thumb animation="bouncy" />
                            </Switch>
                        </XStack>
                        <Text
                            color={colors.text}
                            fontSize={'$2'}
                            marginBottom={'$2'}
                            flexWrap='wrap'
                            width={'95%'}
                        >*GeoFences prevent group use from outside a certain location. Requires users to give location permission. User's locations are never stored.</Text>
                        {enableGeoFence ?
                            <>
                                <Button
                                    iconAfter={Plus}
                                    scaleIcon={1.5}
                                    fontSize={'$5'}
                                    textAlign="left"
                                    color={colors.text}
                                    backgroundColor={colors.accent.dark}
                                    width={'95%'}
                                    onPress={handleAddLocation}
                                >Capture Current Location</Button>
                                <H3
                                    marginTop={'$3'}
                                    color={colors.text}
                                    alignSelf='flex-start'
                                    marginLeft={'$3'}
                                >GeoFences:</H3>
                            </>
                            : null
                        }
                        {formData.geoFences?.map((geoFence, index) =>
                            <YStack
                                width={'95%'}
                                backgroundColor={colors.secondaryAccent.light}
                                borderRadius={'$3'}
                                margin={'$1'}
                                padding={'$1'}
                                key={index}
                                onLongPress={() => handleDeleteGeoFence(index)}
                            >
                                <Text
                                    fontSize={'$6'}
                                    fontWeight={'normal'}
                                    color={colors.text}
                                    marginLeft={'$2'}
                                    marginBottom={'$1'}
                                >{`Latitude: ${geoFence.lat?.toFixed(5)}°`}</Text>
                                <Text
                                    fontSize={'$6'}
                                    color={colors.text}
                                    marginLeft={'$2'}
                                    marginBottom={'$1'}
                                >{`Longitude: ${geoFence.lng?.toFixed(5)}°`}</Text>
                                <XStack
                                    marginLeft={'$2'}
                                    marginBottom={'$1'}
                                >
                                    <Text
                                        fontSize={'$6'}
                                        color={colors.text}
                                    >{'Radius:'}</Text>

                                    <Button
                                        height={0}
                                        width={5}
                                        padding={7}
                                        paddingLeft={15}
                                        paddingRight={15}
                                        margin={3}
                                        color={colors.text}
                                        backgroundColor={colors.accent.light}
                                        iconAfter={Minus}
                                        onPress={() => {
                                            const geoFences = formData.geoFences;
                                            if (geoFences){
                                                geoFences[index].radius -= .1;
                                                setFormData({ ...formData, geoFences });
                                            }
                                        }}
                                    />

                                    <Text
                                        fontSize={'$6'}
                                        color={colors.text}
                                        width={70}
                                        textAlign='center'
                                    >{`${geoFence.radius?.toFixed(1)} km`}</Text>

                                    <Button
                                        height={0}
                                        width={5}
                                        padding={7}
                                        paddingLeft={15}
                                        paddingRight={15}
                                        margin={3}
                                        color={colors.text}
                                        backgroundColor={colors.accent.light}
                                        iconAfter={Plus}
                                        onPress={() => {
                                            const geoFences = formData.geoFences;
                                            if (geoFences){
                                                geoFences[index].radius += .1;
                                                setFormData({ ...formData, geoFences });
                                            }
                                        }}
                                    />

                                </XStack>
                            </YStack>)}
                    </YStack>
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
                    >{local.groupId === 'new' ? 'Add Location Group' : 'Update Location Group'}</Button>
                    {local.groupId !== 'new' ?
                        <Button
                            color={colors.text}
                            backgroundColor={colors.secondaryAccent.light}
                            width={'auto'}
                            marginTop={'$3'}
                            marginBottom={100}
                            onPress={deleteLocationGroup}
                        >Delete Location Group</Button>
                        : null}
                </YStack>

            </BlurHeader>

        </KeyboardAvoidingView>
    );
}