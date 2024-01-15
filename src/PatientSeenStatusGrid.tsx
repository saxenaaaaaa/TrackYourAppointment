import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text } from 'react-native';
import { Pressable } from '@react-native-material/core';

export type PatientSeenStatus = {
    id: number;
    status: boolean
}

interface PatientSeenStatusGridProps {
    patientSeenStatusTable: PatientSeenStatus[]
    onPress: (patientId: number) => void
}

export default function PatientSeenStatusGrid({ patientSeenStatusTable, onPress }: PatientSeenStatusGridProps): React.JSX.Element {

    const screenWidth = Dimensions.get('window').width;
    const renderPatientSeenStatusButton = (patientSeenStatus: PatientSeenStatus) => (
        <Pressable key={patientSeenStatus.id}
            onPress={() => onPress(patientSeenStatus.id)}
            style={
                [
                    styles.item,
                    {
                        width: screenWidth / 6 + 10,
                        backgroundColor: patientSeenStatus.status ? "green" : "black"
                    }
                ]
            }
        >
            <Text style={{ fontWeight: '500', color: 'white' }}>{patientSeenStatus.id}</Text>
        </Pressable>
    );

    return (
        <ScrollView style={{ marginLeft: 1 }} contentContainerStyle={styles.container}>
            {patientSeenStatusTable.map(renderPatientSeenStatusButton)}
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center', // Adjust as needed
    },
    item: {
        backgroundColor: 'black',
        padding: 20,
        alignItems: 'center',
        borderColor: 'white',
        borderWidth: 1
    },
});