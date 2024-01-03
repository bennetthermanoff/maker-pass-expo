export type Machine = {
    id: string;
    name: string;
    photo: string|null;
    photoContentType: string|null;
    mqttTopic: string|null;
    enabled: boolean;
    solenoidMode: boolean;
    enableKey: string|null;
    lastUsedBy: string|null;
    latestTagOutId: string|null;
}