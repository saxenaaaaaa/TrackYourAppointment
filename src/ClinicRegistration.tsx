import { Button, Flex, TextInput } from "@react-native-material/core";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { serverUrl } from "./SessionInfo";
import SelectDropdown from 'react-native-select-dropdown'
import { DoctorDataDTO, HttpStatusCode } from "./App";

export interface ClinicRegistrationProps {
    onLoginSuccessful: (doctorDataDto: DoctorDataDTO) => void;
}

async function fetchDoctors(): Promise<any> {
    const resourceUrl = `${serverUrl}/doctor`
    console.log("Resource url is : ", resourceUrl);
    const response = await fetch(`${resourceUrl}/`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        }
    });
    return response.json()
} 


// todo: We need to have some otp mechanism during registration otherwise any clinic can register 
// on behalf of some other clinic
export default function ClinicRegistration({ onLoginSuccessful }: ClinicRegistrationProps): React.JSX.Element {
    const [doctorsList, setDoctorsList] = useState<DoctorDataDTO[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorDataDTO | null>(null);
    const [doctorPassword, setDoctorPassword] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const responseJson = await fetchDoctors()
                setDoctorsList(responseJson.doctorsList);
                console.log("Successfully fetched doctors list from the server : ", responseJson.doctorsList);
            } catch(error) {
                console.error("There was an error getting doctor's list from the server", error);
            }
        })();
    }, []);

    async function loginHandler(_id: string, doctorPassword: string): Promise<Response | null> {
        try {
            const resourceUrl = `${serverUrl}/doctor`
            return fetch(`${resourceUrl}/login`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({_id: _id, password: doctorPassword}),
            });
        } catch(error) {
            console.error("There was error logging in.")
            return Promise.resolve(null)
        }
    }

    return (
        <Flex fill direction="column" justify="center" style={{ backgroundColor: "black" }}>
            <SelectDropdown
                buttonStyle={{ width: "auto", marginHorizontal: 32, marginBottom: 5, borderRadius: 5 }}
                buttonTextStyle={{textAlign: "left"}} 
                rowTextStyle={{textAlign: "left"}} 
                defaultButtonText="Select Doctor"
                data={doctorsList}
                onSelect={selectedDoctorListItem => setSelectedDoctor(selectedDoctorListItem)}
                buttonTextAfterSelection={selectedDoctorListItem => `Dr. ${selectedDoctorListItem.name}`}
                rowTextForSelection={selectedDoctorListItem => `Dr. ${selectedDoctorListItem.name}`}
            />
            <TextInput
                label="Enter Password"
                style={{ width: "auto", marginHorizontal: 32, marginBottom: 8 }}
                value={doctorPassword}
                onChangeText={text => setDoctorPassword(text)} />
            <Button title="Login" style={{ width: "auto", marginHorizontal: 32 }} onPress={async () => {
                if(selectedDoctor && doctorPassword) {
                    const response = await loginHandler(selectedDoctor._id!, doctorPassword);
                    if(response && response.status === HttpStatusCode.OK) {
                        Alert.alert("Login Successful")
                        onLoginSuccessful(selectedDoctor)
                    }
                    else if(response && response.status === HttpStatusCode.UNAUTHORIZED) {
                        Alert.alert("Wrong Password. Please try again.")
                    }
                    else {
                        console.log("Error. Response from server : ", response)
                        Alert.alert("Something went wrong. Please try again.")
                    }
                }
                else {
                    Alert.alert("All fields are mandatory");
                }
            }} />
        </Flex>
    )
}