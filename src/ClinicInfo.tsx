import React from 'react';
import { getTodaysDate } from './util/utils';
import { Box, Stack, Text } from '@react-native-material/core';

type ClinicInfoProps = {
    doctorName: string
}

export function isClinicOpenToday() {
    return true;//(new Date().getDay() !== 0);
}

export default function ClinicInfo({ doctorName }: ClinicInfoProps): React.JSX.Element {

    const date = getTodaysDate();
    return (
        <Box style={{ backgroundColor: 'black', borderRadius: 0 }}>
            <Stack style={{ padding: 8 }} direction="row" justify="between" wrap>
                <Text style={{ marginBottom: 1 }} color='white' variant="h5">
                    Dr. {doctorName}'s clinic
                </Text>
                <Text style={{ marginBottom: 1 }} color='white' variant="h6">
                    {date}
                </Text>
            </Stack>
            {!isClinicOpenToday() ? (<Text color="white" variant="body2">
                The clinic is closed today.
            </Text>) : null}
        </Box>
    );
}

