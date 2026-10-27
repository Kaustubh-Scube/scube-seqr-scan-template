import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import ViewCertificate from '@/components/ViewCertificate'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'

type Props = {}

const ScanHistoryDetails = ({ }: Props) => {

    const { certificate_details } = useLocalSearchParams<{ certificate_details: string }>();

    const navigation = useNavigation();

    console.log(certificate_details, "certificate_details");


    useEffect(() => {
        const parsedDetails: IScanHistoryData = JSON.parse(certificate_details);

        navigation.setOptions({
            header: () => (
                <View className='flex-row items-center p-4 bg-white'>
                    <Button
                        variant={"ghost"}
                        size={"icon"}
                        onPress={() => router.back()}
                    >
                        <Icon as={ChevronLeft} className={`text-stone-900`} />
                    </Button>

                    <Text className='text-base xs:text-lg font-semibold text-black'>
                        {parsedDetails.document_id}
                    </Text>
                </View>
            )
        })
    }, []);

    return (
        <View className='flex-1 bg-white p-4'>
            <ViewCertificate scannedResults={JSON.parse(certificate_details)} />
        </View>
    )
}

export default ScanHistoryDetails