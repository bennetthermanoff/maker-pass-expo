import { MakerspaceConfig } from '../types/makerspaceServer';

export const getAuthHeaders = (makerspace:MakerspaceConfig) => ({ headers:{
    userid: makerspace.user?.userId, accesstoken: makerspace.user?.token, usertype: makerspace.user?.userType,
} });