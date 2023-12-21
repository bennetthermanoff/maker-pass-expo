export interface MakerspaceConfig {
    id:string,
    name: string,
    website?: string,
    serverAddress: string,
    serverPort: number,
    adminPassword: string,
    registrationPassword: string,
    theme: MakerspaceTheme,
    user?:{
        userId: string,
        userType: string,
        token: string,
        userName?: string,
        userEmail?: string,
    }
}
export interface MakerspaceTheme {
    primary: ColorName,
    secondary: ColorName
}
export interface PingResponse {
    message: string,
    server:MakerspaceConfig,
}
export interface MakerspaceServers {
    [id:string]:MakerspaceConfig,
}

export type Color = `${Sel}${ColorName}${ColorNumber}${LightDark}`;
type Sel = '$';
export type ColorName = 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';
export type LightDark = 'Light' | 'Dark';
export type ColorNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type ColorResponse ={
    [id:string]:Color|ColorResponse
}