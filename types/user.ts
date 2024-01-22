export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
    accessToken: string | null;
    userType: UserType;
    additionalInfo: object | null;
    preferences: object | null;
    permissionObject: PermissionObject;
};
export type UserType = 'admin' | 'user' | 'technician';
export type PermissionObject = { groups: { id: string; permission: boolean; }[], machines: { id: string; permission: boolean; }[] };