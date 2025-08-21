import axios from './axiosConfig';

export const fetchMyGroups = () => axios.get(`/groups`);
export const createGroup = (payload) => axios.post(`/groups`, payload);
export const joinGroupByCode = (code) => axios.post(`/groups/join/code/${code}`);
export const joinGroupById = (groupId) => axios.post(`/groups/join/id/${groupId}`);
export const fetchMessages = (groupId, params) => axios.get(`/groups/${groupId}/messages`, { params });
export const postMessage = (groupId, payload) => axios.post(`/groups/${groupId}/messages`, payload);
