import { Button, Flex, TextInput } from "@react-native-material/core";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { serverUrl } from "./SessionInfo";
import SelectDropdown from 'react-native-select-dropdown'

export interface ClinicRegistrationProps {
    onSubmit: (doctorName: string, schedule: string) => void;
}


// todo: We need to have some otp mechanism during registration otherwise any clinic can register 
// on behalf of some other clinic
export default function ClinicRegistration({ onSubmit }: ClinicRegistrationProps): React.JSX.Element {
    const [doctorsList, setDoctorsList] = useState([]);
    const [doctorName, setDoctorName] = useState("");
    const [schedule, setSchedule] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const resourceUrl = `${serverUrl}/clinicData`
                const response = await fetch(`${resourceUrl}/getDoctorsList`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    }
                });
                const responseJson = await response.json();
                setDoctorsList(responseJson.doctorsList);
                console.log("Successfully fetched doctors list from the server : ", responseJson.doctorsList);
            } catch(error) {
                console.error("There was an error getting doctor's list from the server");
            }
        })();
    }, []);
    return (
        <Flex fill direction="column" justify="center" style={{ backgroundColor: "black" }}>
            <SelectDropdown
                buttonStyle={{ width: "auto", marginHorizontal: 32, marginBottom: 5, borderRadius: 5 }}
                buttonTextStyle={{textAlign: "left"}} 
                rowTextStyle={{textAlign: "left"}} 
                defaultButtonText="Select Doctor"
                data={doctorsList}
                onSelect={selectedDoctorListItem => setDoctorName(selectedDoctorListItem.name)}
                buttonTextAfterSelection={selectedDoctorListItem => `Dr. ${selectedDoctorListItem.name}`}
                rowTextForSelection={doctorListItem => `Dr. ${doctorListItem.name}`}
            />
            <TextInput 
                label="Doctor's Schedule" 
                style={{ width: "auto", marginHorizontal: 32 }} 
                value={schedule} 
                onChangeText={text => setSchedule(text)}/>
            <Button title="Submit" style={{ width: "auto", marginHorizontal: 32 }} onPress={() => {
                if(doctorName && schedule) {
                    onSubmit(doctorName, schedule);
                }
                else {
                    Alert.alert("Kripya doctor ka naam aur schedule bharein!!");
                }
            }} />
        </Flex>
    )
}