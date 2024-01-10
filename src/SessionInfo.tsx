import React, {useEffect, useState} from 'react';
import { Alert, Text, View } from 'react-native';
import PatientSeenStatusGrid, { PatientSeenStatus } from './PatientSeenStatusGrid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodaysDate } from './util/utils';

export enum SessionCurrentStatus {
    NOT_STARTED = "Not Started",
    ONGOING = "On Going",
    ENDED = "Ended"
}

const serverUrl = "http://192.168.1.7:8000";

function initializePatientSeenStatusGrid(): Array<PatientSeenStatus> {
    let initialPatientSeenStatusGrid = new Array<PatientSeenStatus>(200);//.map((patientSeenStatus, index) => {return {id: index, seenStatus: false}});
    for(let i=0; i<200; i++) {
        initialPatientSeenStatusGrid[i] = {
            id: i+1,
            status: false
        }
    }
    return initialPatientSeenStatusGrid;
}

export interface SessionInfoProps {
    clinicInfoData: {
        doctorName: string;
    }
}

export interface ClinicDataDTO {
    patientSeenStatusList: PatientSeenStatus[],
    doctorName: string;
    startTime: string;
    currentStatus: SessionCurrentStatus;
    date: string
}

export default function SessionInfo({clinicInfoData}: SessionInfoProps): React.JSX.Element {
    
    const todaysDate = getTodaysDate();
    const startTime = "11 am";
    const [patientSeenStatusGrid, setPatientSeenStatusGrid] = useState<PatientSeenStatus[]>(initializePatientSeenStatusGrid);
    const seenPatients = patientSeenStatusGrid.filter(patientSeenStatus => patientSeenStatus.status === true)
    let currentStatus = SessionCurrentStatus.NOT_STARTED;
    if(seenPatients.length > 0) {
        currentStatus = SessionCurrentStatus.ONGOING // todo: see how we can change the status to finished
    }
    let clinicDataDto: ClinicDataDTO = {
        doctorName: clinicInfoData.doctorName,
        date: todaysDate,
        patientSeenStatusList: patientSeenStatusGrid,
        startTime: startTime,
        currentStatus: currentStatus
    }
    // this effect is used to load the grid status from the storage if there exists any saved status and update the state to display where use left off 
    useEffect(() => {
        (async () => {
            const savedPatientSeenStatusGrid = await AsyncStorage.getItem(todaysDate);
            // console.log("retrieving patient grid",savedPatientSeenStatusGrid);
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
        (async () => {
            try {
                await AsyncStorage.setItem(todaysDate, JSON.stringify(patientSeenStatusGrid))
                const resourceUrl = `${serverUrl}/clinicData`
                await fetch(`${resourceUrl}/update`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(clinicDataDto),
                }) 
                console.log("Successfully sent event data");  
            } catch(error) {
                console.error("There was some error sending udpate data to server.", error);
            }
        })();
        
    },[patientSeenStatusGrid, clinicDataDto]);

    async function onPressHandler(patientId: number) {
        
        const nextPatientSeenStatusGrid = patientSeenStatusGrid.map(patientSeenStatus => {
            if(patientSeenStatus.id === patientId) {
                return {
                    ...patientSeenStatus,
                    status: !patientSeenStatus.status
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
                // await AsyncStorage.setItem(todaysDate, JSON.stringify(patientSeenStatusGrid));
            }},
        ]);
        for(let i=0; i<patientSeenStatusGrid.length; i++) {
            const patientSeenStatus = patientSeenStatusGrid[i];
            if(patientSeenStatus.id === patientId) {
                if(patientSeenStatus.status === true) {
                    createTwoButtonAlert();
                    return;
                }
            }
        }
        setPatientSeenStatusGrid(nextPatientSeenStatusGrid);
        // await AsyncStorage.setItem(todaysDate, JSON.stringify(patientSeenStatusGrid));
    }

    return (
        <View>
            <Text>Starts at: {startTime}</Text>
            <Text>Status: {currentStatus}</Text>
            <PatientSeenStatusGrid patientSeenStatusTable={patientSeenStatusGrid} onPress={onPressHandler}/>
        </View>
    );
}