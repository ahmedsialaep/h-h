import api from "./http-common";

export const adminApi = {
    get: (url: string, config?: any) =>
        api.get(`/admin${url}`, config),

    post: (url: string, data?: any, config?: any) =>
        api.post(`/admin${url}`, data, config),

    put: (url: string, data?: any, config?: any) =>
        api.put(`/admin${url}`, data, config),

    delete: (url: string, config?: any) =>
        api.delete(`/admin${url}`, config),
};