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
    primary: string,
    secondary: string
}
export interface PingResponse {
    message: string,
    server:MakerspaceConfig,
}
export interface MakerspaceServers {
    [id:string]:MakerspaceConfig,
}