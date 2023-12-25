export interface MakerspaceConfig {
    id:string,
    name: string,
    website?: string,
    serverAddress: string,
    serverPort: number,
    registrationKey?: string,
    registrationType?: string,
    theme: MakerspaceTheme,
    hasGeoFences?: boolean,
    user?:{
        userId: string,
        userType: string,
        token: string,
        userName?: string,
        userEmail?: string,
    }
    additionalInfoFields?: AdditionalInfoField[]
}
export interface MakerspaceTheme {
    primary: ColorName,
    secondary: ColorName
}
export interface PingResponse {
    message: string,
    server:MakerspaceConfig|null,
}
export type MakerspaceServers = string [];

export type Color = `${Sel}${ColorName}${ColorNumber}${LightDark}`;
type Sel = '$';
export type ColorName = 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';
export type LightDark = 'Light' | 'Dark';
export type ColorNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type ColorResponse ={
    [id:string]:Color|ColorResponse
}
export type AdditionalInfoField = {
    name: string,
    description?:string,
    type: 'text' | 'number' | 'tel' | 'checkbox' | 'dropdown' | 'date',
    options?: string[],
    regEx?: string,
    required?: boolean
};
