import axiosInstance from "@/utils/axiosInstance";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useCallback, useState } from "react";
import useAuth from "./useAuth";

type ReactNativeFile = {
    uri: string;
    type?: string;
    name?: string;
};

type FormDataValue =
    | string
    | number
    | boolean
    | Blob
    | File
    | ReactNativeFile;

type FormDataFields = Record<string, FormDataValue>;

type PostDataResult<T> =
    | (T & { ok: true })
    | {
        ok: false;
        message: string;
        status: number;
        [key: string]: unknown
    };

interface UseFetchFormDataOptions extends AxiosRequestConfig<FormData> {
    /** Base headers to merge into every request (do NOT set Content-Type – let fetch set it) */
    headers?: Record<string, string>;
    /** Called on every successful response */
    onSuccess?: (data: unknown) => void;
    /** Called on every error */
    onError?: (error: AxiosError) => void;
};

interface UseFetchFormDataReturn<T extends object> {
    /** True while the request is in-flight */
    isLoading: boolean;
    /** Populated when the request fails; null otherwise */
    error: AxiosError | null;
    /** Populated on success; null before first call or after a reset */
    data: T | null;
    /** Fire a POST request. Pass the URL and the fields to send. */
    postData: <R extends object = T>(url: string, fields: FormDataFields) => Promise<PostDataResult<R>>;
    /** Reset state back to initial values */
    reset: () => void;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useFormDataPost
 *
 * A reusable hook that handles loading, error and response state for any
 * multipart/form-data POST request.
 *
 * @example
 * const { isLoading, error, data, postData } = useFormDataPost<MyResponse>();
 *
 * const handleSubmit = async () => {
 *   const result = await postData("https://api.example.com/upload", {
 *     name: "John",
 *     avatar: imageFile,   // File / Blob also supported
 *   });
 *   if (result) console.log(result);
 * };
 */
function useFetchFormData<R extends object = Record<string, unknown>>(
    options: UseFetchFormDataOptions = {},
): UseFetchFormDataReturn<R> {

    const { onSuccess, onError, ...restOptions } = options;

    const [data, setData] = useState<R | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<AxiosError | null>(null);

    const { setLoginDetailsLocally } = useAuth();

    const postData = useCallback(
        async <R extends object>(url: string, formDataFields: FormDataFields): Promise<PostDataResult<R>> => {

            const formData = new FormData();
            Object.entries(formDataFields).forEach(([key, value]) => {
                if (
                    typeof value === "object" &&
                    value !== null &&
                    "uri" in value
                ) {
                    formData.append(key, value as any);
                } else {
                    formData.append(key, String(value));
                }
            });

            setIsLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.post(url, formData, restOptions);

                if (response.status != 200) {
                    setError(response.data);
                    return {
                        ok: false,
                        ...response.data
                    };
                };

                if (
                    (response.data.data && "accesstoken" in response.data.data) ||
                    "accesstoken" in response.headers
                ) {
                    setLoginDetailsLocally({
                        accessToken:
                            response.data.data?.accesstoken ||
                            response.headers.accesstoken,
                    });
                }

                setData(response.data);
                onSuccess?.(response.data);

                return {
                    ok: true,
                    ...response.data as R
                };

            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const apiError = error.response?.data;   // ← { status: 409, message: "..." }
                    setData(null);
                    setError(error);
                    onError?.(error);
                    return { ok: false, ...apiError } as PostDataResult<R>;
                    // fall back to AxiosError if no body
                }

                const genericError = new AxiosError("An unknown error occurred");
                setData(null);
                setError(genericError);
                onError?.(genericError);
                return { ok: false, message: "An unknown error occurred" } as PostDataResult<R>;

            } finally {
                setIsLoading(false);
            }
        },
        [onSuccess, onError, setData, setError, setIsLoading]
    );

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setData(null);
    }, []);

    return { isLoading, error, data, postData, reset };
};

export default useFetchFormData;