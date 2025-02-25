export type Machine = {
    id: string;
    name: string;
    photo: string|null;
    photoHash: string|null;
    mqttTopic: string|null;
    enabled: boolean;
    solenoidMode: boolean;
    enableKey: string|null;
    lastUsedBy: string|null;
    lastUsedByName:string|null;
    latestTagOutId: string|null;
}

export type LocationGroupMap = {
    [key: string]: LocationGroupBody
}
export type LocationGroupArray = Array<LocationGroupBody & {id:string}>
export type LocationGroupBody = {
    name: string;
    groups: string[];
    geoFences: GeoFence[];
}

export type MachineGroupMap={
    [key: string]: MachineGroupBody
}
export type MachineGroupBody={
    name: string;
    machineIds: string[];
    geoFences: GeoFence[];
}
export type MachineGroupArray = Array<MachineGroupBody & {id:string}>
export type GeoFence = {
    lat: number,
    lng: number,
    radius: number,
};

export type TagOut = {
    id: string;
    machineId: string;
    userId: string;
    reason: string;
    removedDate: Date|null;
    removedBy: string|null;
    removedReason: string|null;
    createdAt: string;
}
export type TagOutWithName = TagOut & { userName: string , removedByName?:string|null};

export type PermissionGroup = {
    name: string;
    machineIds: string[];
};
export type PermissionGroupMap = {
    [groupId:string]:{
        name:string;
        machineIds:string[];
    }
}
export type PermissionGroupArray = Array<PermissionGroup & {id:string}>

