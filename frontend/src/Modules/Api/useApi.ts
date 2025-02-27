// Modules/Api/useApi.ts
import {useCallback, useMemo} from "react";
import pprint from "Utils/pprint";
import {useErrorProcessing} from "Core/components/ErrorProvider";
import {axios} from "./axiosConfig";

type AxiosConfig = Parameters<typeof axios.get>[1] | undefined;

export const useApi = () => {
    const {byResponse} = useErrorProcessing();

    const get = useCallback(async <T = any>(
        url: string,
        config?: AxiosConfig,
        errorPopuping: boolean = true
    ): Promise<T> => {
        try {
            const response = await axios.get<T>(url, config);
            pprint('API:' + url);
            pprint(response.data);
            return response.data;
        } catch (error) {
            if (errorPopuping) byResponse(error);
            throw error;
        }
    }, [byResponse]);

    const post = useCallback(async <T = any>(
        url: string,
        data?: any,
        config?: AxiosConfig,
        errorPopuping: boolean = true
    ): Promise<T> => {
        try {
            const response = await axios.post<T>(url, data, config);
            pprint('API:' + url);
            pprint(response.data);
            return response.data;
        } catch (error) {
            if (errorPopuping) byResponse(error);
            throw error;
        }
    }, [byResponse]);

    const put = useCallback(async <T = any>(
        url: string,
        data?: any,
        config?: AxiosConfig,
        errorPopuping: boolean = true
    ): Promise<T> => {
        try {
            const response = await axios.put<T>(url, data, config);
            pprint('API:' + url);
            pprint(response.data);
            return response.data;
        } catch (error) {
            if (errorPopuping) byResponse(error);
            throw error;
        }
    }, [byResponse]);

    const patch = useCallback(async <T = any>(
        url: string,
        data?: any,
        config?: AxiosConfig,
        errorPopuping: boolean = true
    ): Promise<T> => {
        try {
            const response = await axios.patch<T>(url, data, config);
            pprint('API:' + url);
            pprint(response.data);
            return response.data;
        } catch (error) {
            if (errorPopuping) byResponse(error);
            throw error;
        }
    }, [byResponse]);

    const del = useCallback(async <T = any>(
        url: string,
        config?: AxiosConfig,
        errorPopuping: boolean = true
    ): Promise<T> => {
        try {
            const response = await axios.delete<T>(url, config);
            pprint('API:' + url);
            pprint(response.data);
            return response.data;
        } catch (error) {
            if (errorPopuping) byResponse(error);
            throw error;
        }
    }, [byResponse]);

    const api = useMemo(() => ({get, post, put, patch, delete: del}), [get, post, put, patch, del]);

    return {api};
};
