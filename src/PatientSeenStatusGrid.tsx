import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import Button from './util/Button';

export type PatientSeenStatus = {
    id: number;
    seenStatus: boolean
}

interface PatientSeenStatusGridProps {
    patientSeenStatusTable: PatientSeenStatus[]
    onPress: (patientId: number) => void
}

export default function PatientSeenStatusGrid({patientSeenStatusTable, onPress}: PatientSeenStatusGridProps): React.JSX.Element {
    
    // console.log(patientSeenStatusTable);
    const patientSeenStatusRenderItem = ({item}: {item: PatientSeenStatus}): React.JSX.Element => {
        return (
            <Button 
                backgroundColor = {item.seenStatus ? "green" : "black"}
                text = {`${item.id}`}
                onPress={() => onPress(item.id)} // add interactivity when adding state
                />
        )
    }
    
    return (
        <FlatList 
            data={patientSeenStatusTable} 
            renderItem={patientSeenStatusRenderItem}
            keyExtractor={item => `${item.id}`}
            numColumns={4}/>
    );
}