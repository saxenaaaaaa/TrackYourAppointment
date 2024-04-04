import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import PatientSeenStatusGrid, { PatientSeenStatus } from './PatientSeenStatusGrid';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodaysDate } from './util/utils';
import { Box, Divider, Stack, Switch, Text } from '@react-native-material/core';
import { ClinicInfoData, HttpStatusCode, storage } from "./App";
export enum SessionCurrentStatus {
    NOT_STARTED = "Not Started",
    ONGOING = "On Going",
    ENDED = "Ended"
}

const SERVER_URI = "www.digitracker.org";
// const SERVER_URI = "192.168.1.10"
// export const serverUrl = `http://${SERVER_URI}:8000`;
export const serverUrl = `https://${SERVER_URI}:8000`;

function initializePatientSeenStatusGrid(): Array<PatientSeenStatus> {
    let initialPatientSeenStatusGrid = new Array<PatientSeenStatus>(200);//.map((patientSeenStatus, index) => {return {id: index, seenStatus: false}});
    for (let i = 0; i < 200; i++) {
        initialPatientSeenStatusGrid[i] = {
            id: i + 1,
            status: false
        }
    }
    return initialPatientSeenStatusGrid;
}

export interface SessionInfoProps {
    clinicInfoData: ClinicInfoData;
}

export interface ClinicDataDTO {
    doctorId: string,
    patientSeenStatusList: PatientSeenStatus[],
    currentStatus: SessionCurrentStatus;
    date: string
}

export default function SessionInfo({ clinicInfoData }: SessionInfoProps): React.JSX.Element {

    const todaysDate = getTodaysDate();
    const schedule = clinicInfoData.schedule!;
    const [patientSeenStatusGrid, setPatientSeenStatusGrid] = useState<PatientSeenStatus[]>(initializePatientSeenStatusGrid);
    const [sessionEnded, setSessionEnded] = useState<boolean>(false);
    const seenPatients = patientSeenStatusGrid.filter(patientSeenStatus => patientSeenStatus.status === true)
    let currentStatus = SessionCurrentStatus.NOT_STARTED;
    if(sessionEnded) {
        currentStatus = SessionCurrentStatus.ENDED;
    }
    else if (seenPatients.length > 0) {
        currentStatus = SessionCurrentStatus.ONGOING // todo: see how we can change the status to finished
    }
    
    // this effect is used to load the grid status from the storage if there exists any saved status and update the state to display where use left off 
    useEffect(() => {
        console.log("Effect run");
        (async () => {
            const savedData = await storage.getString(todaysDate);
            // console.log("retrieving patient grid",savedPatientSeenStatusGrid);
            if (savedData) {
                const {sessionEnded, savedPatientSeenStatusGrid } = JSON.parse(savedData);
                setPatientSeenStatusGrid(savedPatientSeenStatusGrid);
                setSessionEnded(sessionEnded);
            }
        })();

    }, []);
    // this effect is used to update the storage everytime there is an update in the grid status so that we dont lose the data if the app is closed
    // deliberately or in accidental crash
    useEffect(() => {
        // console.log("Saving patient grid",patientSeenStatusGrid);
        // todo: this will save to storage on every update. See how to batch these updates and save only  when the user is about to close the app
        const seenPatients = patientSeenStatusGrid.filter(patientSeenStatus => patientSeenStatus.status === true)
        let currentStatus = SessionCurrentStatus.NOT_STARTED;
        if(sessionEnded) {
            currentStatus = SessionCurrentStatus.ENDED;
        }
        else if (seenPatients.length > 0) {
            currentStatus = SessionCurrentStatus.ONGOING // todo: see how we can change the status to finished
        }
        let clinicDataDto: ClinicDataDTO = {
            doctorId: clinicInfoData._id!,
            date: todaysDate,
            patientSeenStatusList: patientSeenStatusGrid,
            currentStatus: currentStatus
        };
        console.log("Going to send clinic data.", clinicDataDto.currentStatus);
        (async () => {
            try {
                await storage.set(todaysDate, JSON.stringify({sessionEnded: sessionEnded, savedPatientSeenStatusGrid: patientSeenStatusGrid}))
                const resourceUrl = `${serverUrl}/clinicData`
                const response = await fetch(`${resourceUrl}/update`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(clinicDataDto),
                })
                if(response.status !== HttpStatusCode.OK) {
                    console.log("Error sending event data. Received response : ", response);
                    console.log("Please retry the action as required.");
                    // todo: reverse the action in UI as well because we failed to send data to the server.
                    //       At the same time, ask the user to try again sending.
                }
                else {
                    console.log("Successfully sent event data");
                }
            } catch (error) {
                // todo: reverse the action in UI as well because we failed to send data to the server.
                //       At the same time, ask the user to try again sending.
                console.error("There was some error sending udpate data to server.", error);
            }
        })();

    }, [patientSeenStatusGrid, sessionEnded]);

    function onPressHandler(patientId: number) {

        if(sessionEnded) {
            Alert.alert("Restart session?", "Aap session end kar chuke hain. Kya aap session jaari rakhna chahte hain ?", [
                {
                    text: "No",
                    onPress: () => {},
                    style: 'cancel'
                },
                {
                    text: "Yes",
                    onPress: () => {
                        setSessionEnded(false);
                    }
                }
            ]);
            return;
        }
        const nextPatientSeenStatusGrid = patientSeenStatusGrid.map(patientSeenStatus => {
            if (patientSeenStatus.id === patientId) {
                return {
                    ...patientSeenStatus,
                    status: !patientSeenStatus.status
                }
            }
            else {
                return patientSeenStatus;
            }
        });
        const createMisTouchAlert = () => Alert.alert('Confirm!', `Kya aapne galti se ${patientId} touch kar diya?`, [
            {
                text: 'Haan',
                onPress: () => { },
                style: 'cancel',
            },
            {
                text: 'Nahi', onPress: () => {
                    setPatientSeenStatusGrid(nextPatientSeenStatusGrid);
                    // await AsyncStorage.setItem(todaysDate, JSON.stringify(patientSeenStatusGrid));
                }
            },
        ]);
        for (let i = 0; i < patientSeenStatusGrid.length; i++) {
            const patientSeenStatus = patientSeenStatusGrid[i];
            if (patientSeenStatus.id === patientId) {
                if (patientSeenStatus.status === true) {
                    createMisTouchAlert();
                    return;
                }
            }
        }
        setPatientSeenStatusGrid(nextPatientSeenStatusGrid);
        // await AsyncStorage.setItem(todaysDate, JSON.stringify(patientSeenStatusGrid));
    }

    function onPressEndSession(newValue: boolean) {
        console.log("Hello");
        const createTwoButtonAlert = () => Alert.alert('Confirm!', undefined, [
            {
                text: 'Cancel',
                onPress: () => { },
                style: 'cancel',
            },
            {
                text: `Yes, ${newValue ? 'End Session' : 'Start Session'}`, onPress: () => {
                    
                        setSessionEnded(newValue);
                    
                    // await AsyncStorage.setItem(todaysDate, JSON.stringify(patientSeenStatusGrid));
                }
            },
        ]);
        createTwoButtonAlert();
    }

    return (
        <Box>
            <Box style={{ padding: 8, backgroundColor: 'black', borderRadius: 0 }}>
                <Stack direction="column">
                    <Text style={{ marginBottom: 1 }} variant="subtitle1" color='white'>
                        Schedule: {schedule}
                    </Text>
                    <Stack style={{ padding: 1, paddingTop: 20 }} direction="row" justify="between">
                        <Text style={{ marginBottom: 1, flex: 1 }} color='white' variant="subtitle1">
                            Status: {currentStatus}
                        </Text>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <Text style={{ marginBottom: 1 }} color='white' variant="subtitle1">
                                {sessionEnded ? "Ended!" : "End Session ?"} 
                            </Text>
                            <Switch value={sessionEnded} onValueChange={() => onPressEndSession(!sessionEnded)} />
                        </View>
                    </Stack>
                </Stack>
            </Box>
            <Divider />
            <PatientSeenStatusGrid patientSeenStatusTable={patientSeenStatusGrid} onPress={onPressHandler} />
        </Box>
    );
}