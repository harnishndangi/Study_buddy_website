import axios from './axiosConfig';

export const fetchMyGroups = (userId) => axios.get(`/groups`, { params: { userId } });
export const createGroup = (payload) => axios.post(`/groups`, payload);
export const joinGroupByCode = (code, userId) => axios.post(`/groups/join/code/${code}`, { userId });
export const joinGroupById = (groupId, userId) => axios.post(`/groups/join/id/${groupId}`, { userId });
export const fetchMessages = (groupId, params) => axios.get(`/groups/${groupId}/messages`, { params });
export const postMessage = (groupId, payload) => axios.post(`/groups/${groupId}/messages`, payload);
