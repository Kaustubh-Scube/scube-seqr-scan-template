import { ActivityIndicator, View } from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
    Controller,
    FieldValues,
    SubmitHandler,
    useForm,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import axiosInstance from "@/utils/axiosInstance";
import { INSTITUE_LOGIN, VERIFIER_LOGIN } from "@/utils/routes";
import useAuth from "@/hooks/useAuth";
import useUser from "@/hooks/useUser";
import { Toast, useToast } from "react-native-toast-notifications";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import { storage } from "@/utils/storageService";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import axios from "axios";

type Props = {};

type FormData = {
    userName: "";
    userPass: "";
};

const LoginScreen = ({ }: Props) => {
    const { login_type } = useLocalSearchParams();

    const { setIsUserLoggedIn, setAuthToken } = useAuth();
    const { setUserDetails } = useUser();

    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const [isForgotPasswordVisible, setIsForgotPasswordVisible] =
        useState<boolean>(false);

    const [isUserNameFocused, setIsUserNameFocused] = useState<boolean>(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
    const [forgotVisible, setForgotVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const toast = useToast();

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isValid },
    } = useForm<FormData>({
        mode: "onChange", // Enables real-time validation updates
        defaultValues: {
            userName: "",
            userPass: "",
        },
    });

    const handleUserLogin: SubmitHandler<FormData | FieldValues> = async (
        formData
    ) => {
        const loginBody = new FormData();
        loginBody.append(
            login_type.toString().toLocaleLowerCase() != "institute"
                ? "username"
                : "institute_username",
            formData.userName
        );
        loginBody.append("password", formData.userPass);
        setLoading(true);
        try {
            const response = await axiosInstance.post(
                login_type.toString().toLocaleLowerCase() != "institute"
                    ? VERIFIER_LOGIN
                    : INSTITUE_LOGIN,
                loginBody
            );
            if (!response.data?.success) {
                console.log(response.data?.success, "response.data?.success")
                if (response.data?.message.length > 50) {
                    toast.show(response.data.message, {
                        data: response.data,
                    });
                }

                setError("userName", {
                    type: "custom",
                    message: response.data?.message,
                });
                setError("userPass", {
                    type: "custom",
                    message: response.data?.message,
                });
                setIsUserLoggedIn(false);
                setLoading(false);
                return;
            }

            setAuthToken(
                response.data?.data?.access_token || response.data?.accesstoken
            );
            setUserDetails(response.data?.data);
            storage.set(
                "login_type",
                login_type.toString().toLowerCase()
            );
            setIsUserLoggedIn(true);
            router.replace("/home");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response
                })
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <View className="p-4 gap-8">
                <Text className="text-4xl font-semibold">
                    Welcome back,
                    <Text className="capitalize text-4xl font-semibold">
                        {login_type}
                    </Text>
                </Text>

                <View className="">
                    {/* Form Actions */}
                    <View className="gap-6">
                        <View className="gap-2">
                            <Text className="text-lg">Username</Text>
                            <Controller
                                control={control}
                                name="userName"
                                rules={{
                                    required: "Please enter your username",
                                }}
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <View
                                        className={`border rounded-lg ${isUserNameFocused
                                            ? "border-primary border-2"
                                            : "border-input"
                                            } ${errors.userName && "border-red-500"}`}
                                    >
                                        <Input
                                            className="border-0"
                                            placeholder="Enter your username"
                                            keyboardType="default"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={() => {
                                                onBlur();
                                                setIsUserNameFocused(false);
                                            }}
                                            onFocus={() => {
                                                setIsUserNameFocused(true);
                                            }}
                                        />
                                    </View>
                                )}
                            />
                            {errors.userName && (
                                <Text className="text-destructive">
                                    {errors.userName?.message}
                                </Text>
                            )}
                        </View>

                        <View className="gap-2">
                            <Text className="text-lg">Password</Text>
                            <Controller
                                control={control}
                                name="userPass"
                                rules={{
                                    required: "Please enter your password",
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View
                                        className={`flex-row items-center border rounded-lg ${isPasswordFocused
                                            ? "border-primary border-2"
                                            : "border-input"
                                            } ${errors.userPass && "border-red-500"}`}
                                    >
                                        <Input
                                            className="border-0 border-none flex-1"
                                            placeholder="Enter your password"
                                            keyboardType="default"
                                            secureTextEntry={!isPasswordVisible}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={() => {
                                                onBlur();
                                                setIsPasswordFocused(false);
                                            }}
                                            onFocus={() => {
                                                setIsPasswordFocused(true);
                                            }}
                                        />
                                        <Button
                                            className="ml-auto"
                                            variant={"ghost"}
                                            size={"icon"}
                                            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                        >
                                            {isPasswordVisible ? (
                                                <Icon as={EyeIcon} className="text-primary" />
                                            ) : (
                                                <Icon as={EyeOffIcon} className="text-primary" />
                                            )}
                                        </Button>
                                    </View>
                                )}
                            />

                            {errors.userPass && (
                                <Text className="text-destructive">
                                    {errors.userPass?.message}
                                </Text>
                            )}
                        </View>
                    </View>

                    {login_type.toString().toLocaleLowerCase() != "institute" && (
                        <View className="flex-row items-center justify-between my-2">
                            <View className="flex-row items-center gap-1">
                                <Text>Don't have an account ?</Text>
                                <Button
                                    variant={"ghost"}
                                    size={"sm"}
                                    className="p-0"
                                    onPress={() => router.navigate("/sign-up")}
                                >
                                    <Text className="text-primary" >Sign Up</Text>
                                </Button>
                            </View>

                            {/* <ForgotPasswordDialog
                isForgotPasswordVisible={isForgotPasswordVisible}
                setIsForgotPasswordVisible={setIsForgotPasswordVisible}
              /> */}
                            <Button variant="ghost" onPress={() => setForgotVisible(true)}>
                                <Text className="text-destructive">Forgot Password</Text>
                            </Button>

                            <ForgotPasswordModal
                                visible={forgotVisible}
                                onClose={() => setForgotVisible(false)}
                            />
                        </View>
                    )}
                </View>

                {/* Submit button */}
                <Button onPress={handleSubmit(handleUserLogin)} disabled={loading}>
                    {loading ? <ActivityIndicator size={'small'} /> : <Text>Login</Text>}
                </Button>
            </View>
        </View>
    );
};

export default LoginScreen;
