import React, {useEffect, useState} from 'react';
import { Alert, Text, View } from 'react-native';
import PatientSeenStatusGrid, { PatientSeenStatus } from './PatientSeenStatusGrid';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum SessionCurrentStatus {
    NOT_STARTED = "Not Started",
    ONGOING = "On Going",
    FINISHED = "Finished"
}

function initializePatientSeenStatusGrid(): Array<PatientSeenStatus> {
    let initialPatientSeenStatusGrid = new Array<PatientSeenStatus>(200);//.map((patientSeenStatus, index) => {return {id: index, seenStatus: false}});
    for(let i=0; i<200; i++) {
        initialPatientSeenStatusGrid[i] = {
            id: i+1,
            seenStatus: false
        }
    }
    return initialPatientSeenStatusGrid;
}

export default function SessionInfo(): React.JSX.Element {
    
    const todaysDate = new Date().toLocaleDateString("en-IN");
    const [patientSeenStatusGrid, setPatientSeenStatusGrid] = useState<PatientSeenStatus[]>(initializePatientSeenStatusGrid);
    // this effect is used to load the grid status from the storage if there exists any saved status and update the state to display where use left off 
    useEffect(() => {
        (async () => {
            const savedPatientSeenStatusGrid = await AsyncStorage.getItem(todaysDate);
            console.log("retrieving patient grid",savedPatientSeenStatusGrid);
            if(savedPatientSeenStatusGrid) {
                setPatientSeenStatusGrid(JSON.parse(savedPatientSeenStatusGrid));
            }
        })();
        
    },[]);
    // this effect is used to update the storage everytime there is an update in the grid status so that we dont lose the data if the app is closed
    // deliberately or in accidental crash
    useEffect(() => {
        // console.log("Saving patient grid",patientSeenStatusGrid);
        // todo: this will save to storage on every update. See how to batch these updates and save only  when the user is about to close the app
        (async () => {await AsyncStorage.setItem(todaysDate, JSON.stringify(patientSeenStatusGrid))})();
        
    },[patientSeenStatusGrid]);
    const startTime = "11 am";
    const seenPatients = patientSeenStatusGrid.filter(patientSeenStatus => patientSeenStatus.seenStatus === true)
    let currentStatus = SessionCurrentStatus.NOT_STARTED;
    if(seenPatients.length > 0) {
        currentStatus = SessionCurrentStatus.ONGOING // todo: see how we can change the status to finished
    }

    async function onPressHandler(patientId: number) {
        
        const nextPatientSeenStatusGrid = patientSeenStatusGrid.map(patientSeenStatus => {
            if(patientSeenStatus.id === patientId) {
                return {
                    ...patientSeenStatus,
                    seenStatus: !patientSeenStatus.seenStatus
                }
            }
            else {
                return patientSeenStatus;
            }
        });
        const createTwoButtonAlert = () => Alert.alert('Confirm!', `Kya aapne galti se ${patientId} touch kar diya?`, [
            {
                text: 'Haan',
                onPress: () => {},
                style: 'cancel',
            },
            {text: 'Nahi', onPress: async () => {
                setPatientSeenStatusGrid(nextPatientSeenStatusGrid);
                await AsyncStorage.setItem(todaysDate, JSON.stringify(patientSeenStatusGrid));
            }},
        ]);
        for(let i=0; i<patientSeenStatusGrid.length; i++) {
            const patientSeenStatus = patientSeenStatusGrid[i];
            if(patientSeenStatus.id === patientId) {
                if(patientSeenStatus.seenStatus === true) {
                    createTwoButtonAlert();
                    return;
                }
            }
        }
        setPatientSeenStatusGrid(nextPatientSeenStatusGrid);
        await AsyncStorage.setItem(todaysDate, JSON.stringify(patientSeenStatusGrid));
    }

    return (
        <View>
            <Text>Starts at: {startTime}</Text>
            <Text>Status: {currentStatus}</Text>
            <PatientSeenStatusGrid patientSeenStatusTable={patientSeenStatusGrid} onPress={onPressHandler}/>
        </View>
    );
}