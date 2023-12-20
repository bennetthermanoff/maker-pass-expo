export interface MakerspaceConfig {
    id:string,
    name: string,
    website?: string,
    serverAddress: string,
    serverPort: number,
    adminPassword: string,
    registrationPassword: string,
    theme: {
        light: {
            primary: string,
            secondary: string,
            accent: string,
            error: string,
        },
        dark: {
            primary: string,
            secondary: string,
            accent: string,
            error: string,
        },
    },
}
export interface PingResponse {
    message: string,
    server:MakerspaceConfig,
}
export interface MakerspaceServers {
    [id:string]:MakerspaceConfig,
}