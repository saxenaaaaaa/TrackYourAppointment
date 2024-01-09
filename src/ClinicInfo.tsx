import React from 'react';
import { Text, View } from 'react-native';
import { getTodaysDate } from './util/utils';

type ClinicInfoProps = {
    doctorName: string
}

export function isClinicOpenToday() {
    return (new Date().getDay() !== 0);
}

export default function ClinicInfo({doctorName}: ClinicInfoProps): React.JSX.Element {
    
    const date = getTodaysDate();
    let dateLabel = (<Text>{date}</Text>);
    if(!isClinicOpenToday) {
        dateLabel = (<Text>As it is Sunday, the clinic is closed today</Text>)
    }
    return (
        <View>
            <Text>Welcome to Dr. {doctorName}'s clinic</Text>
            <Text>{dateLabel}</Text>
        </View>
    );
}

