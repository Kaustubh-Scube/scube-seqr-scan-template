import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as Application from 'expo-application';
import sha256 from 'crypto-js/sha256';
import { Alert, Linking, Platform } from 'react-native';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateUniqueStorageKey = (prefix: string) => {
  const uniqueKey = sha256(Application.applicationId + prefix);
  return uniqueKey.toString();
};

export function parseKeysAndValues(data: string) {
  const values = data.split('|').map(value => value.trim())
  const templateId = values[0]
  const isValidTemplete = ["1", "2", "4", "5", "6", "7", "8", "9", "10"].includes(templateId)
  // console.log(isValidTemplete, "isValidTemplete");

  // console.log(templateId, "templateId");
  if (!isValidTemplete) {
    Alert.alert(
      "Invalid QR Code Detected",               // Title
      "Kindly scan the correct QR code.", // Message
      [
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ],
      { cancelable: true }
    );
    return
  }
  const mainKeys = {
    Name: values[1] || "",
    Enrollment_No: values[2] || "",
    Has_completed_the_prescried_training: values[3] || "",
    As_per_our_Competency_Framework_at: values[4] || "",
  }

  let extraKeys = {}
  const isIncluded = ["1", "2", "4", "5", "8", "9", "10"].includes(templateId)
  if (isIncluded) {
    extraKeys = {
      Can_work_as: values[5] || "",
      To_work_under: values[6] || "",
      Valid_up_to: values[7] || "",
      Batch_Number: values[8] || "",
    }
  } else if (templateId == '7') {
    extraKeys = {
      Can_work_as: values[5] || "",
      To_work_under: values[6] || "",
      Valid_up_to: values[7] || "",
      Division_Name: values[8] || "",
      Batch_Number: values[9] || "",
    }
  } else if (templateId === "6") {
    extraKeys = {
      On: values[5] || "",
      Batch_Number: values[6] || "",
    };
  }
  return { ...mainKeys, ...extraKeys }
};

const IOS_APP_ID = process.env.EXPO_PUBLIC_IOS_APP_ID;
const ANDROID_PACKAGE = process.env.EXPO_PUBLIC_ANDROID_PACKAGE;

const IOS_STORE_URL = `https://apps.apple.com/app/id${IOS_APP_ID}`;
const ANDROID_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

export const isUpdateRequired = (current: string, latest: string) => {
  const [currentMajor, currentMinor] = current.split('.')?.map(Number);
  const [latestMajor, latestMinor] = latest.split('.')?.map(Number);

  return (
    currentMajor < latestMajor ||
    (currentMajor === latestMajor && currentMinor < latestMinor)
  );
};

export const getLatestAndroidVersion = async (): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}&hl=en&gl=US`
    );
    const text = await response.text();
    const match = text.match(/\[\[\["([0-9.]+)"\]\]/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

export const getLatestIOSVersion = async (): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${IOS_APP_ID}&country=IN`
    );
    const json = await res.json();
    return json?.results?.[0]?.version ?? null;
  } catch {
    return null;
  }
};

export const getApplicationVersion = async () => {
  try {
    const latestVersion =
      Platform.OS === 'ios'
        ? await getLatestIOSVersion()
        : await getLatestAndroidVersion();

    const currentVersion = Application.nativeApplicationVersion;

    if (
      isUpdateRequired(currentVersion!, latestVersion!)
    ) {
      Alert.alert(
        'Update Required',
        'A new version of the app is available. Please update to continue using the app.',
        [
          {
            text: 'Update Now',
            onPress: () => {
              const url =
                Platform.OS === 'ios'
                  ? IOS_STORE_URL
                  : ANDROID_STORE_URL;

              Linking.openURL(url);

              // // Reset flag so alert can show again
              // setTimeout(() => {
              // 	isAlertVisible.current = false;
              // }, 1000);
            },
          },
        ],
        { cancelable: false }
      );
    }
  } catch (error) {
    console.error('Version check failed:', error);
  }
};

const SECRET_KEY = "12345678901234567890123456789012"; // 32 characters
const IV = "1234567890123456"; // 16 characters

export const decryptAES = (encryptedText: string) => {

  try {
    const key = CryptoJS.enc.Utf8?.parse(SECRET_KEY);
    const iv = CryptoJS.enc.Utf8?.parse(IV);

    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    return result;
  } catch (error) {
    console.error("Decryption Error:", error);
    return null;
  }
};
