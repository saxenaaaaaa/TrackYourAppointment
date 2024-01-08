import React from 'react';
import { Text, View } from 'react-native';

type ClinicInfoProps = {
    doctorName: string
}

export function isClinicOpenToday() {
    return (new Date().getDay() !== 0);
}

export default function ClinicInfo({doctorName}: ClinicInfoProps): React.JSX.Element {
    
    const now = new Date();
    const date = now.toLocaleDateString("en-IN");
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

