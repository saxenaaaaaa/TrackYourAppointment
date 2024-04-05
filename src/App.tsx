/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  View
} from 'react-native';

import ClinicInfo, { isClinicOpenToday } from './ClinicInfo';
import SessionInfo, { serverUrl } from './SessionInfo';
import ClinicRegistration from './ClinicRegistration';
import { MMKV } from 'react-native-mmkv'
import { AppBar, HStack } from '@react-native-material/core';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export const storage = new MMKV();

export enum HttpStatusCode {
  OK = 200,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  INTERNAL_SERVER_ERROR = 500
}

export interface DoctorDataDTO {
  _id?: string;
  name: string;
  schedule?: string;
  password?: string;
}

export type ClinicInfoData = DoctorDataDTO;

function App(): React.JSX.Element {
  const [doctorData, setDoctorData] = useState<DoctorDataDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {

    const savedDoctorData: any = storage.getString("doctorData");
    if (savedDoctorData) {
      setDoctorData(JSON.parse(savedDoctorData));
    }

  }, []);

  if (doctorData) {

    const clinicInfoData: ClinicInfoData = {
      _id: doctorData._id,
      name: doctorData.name,
      schedule: doctorData.schedule
    }

    function updateData(doctorDataDto: DoctorDataDTO) {
      setDoctorData(doctorDataDto);
      storage.set("doctorData", JSON.stringify(doctorDataDto));
    }

    return (
      <View>
        <AppBar title='Welcome To Digitracker' trailing={props => (
          <HStack spacing={5}>
            {isLoading ? <ActivityIndicator />: (<Icon.Button
              name="refresh"
              backgroundColor='black'
              onPress={async () => {
                setIsLoading(true);
                const response = await refreshDoctor(doctorData._id!)
                setIsLoading(false);
                if (response.status) {
                  console.log("Refreshed");
                  updateData(response.data!);
                  Alert.alert("Refreshed Successfully.")
                }
                else {
                  Alert.alert("Unable to refresh. Please check your internet connection")
                }
              }}
              {...props}
            > Refresh
            </Icon.Button>)}

            <Icon.Button
              name="logout"
              backgroundColor='black'
              onPress={() => {
                const createTwoButtonAlert = () => Alert.alert('Confirm!', undefined, [
                  {
                    text: 'Cancel',
                    onPress: () => { },
                    style: 'cancel',
                  },
                  {
                    text: `Yes, Logout`, onPress: () => {

                      setDoctorData(null);
                      storage.clearAll();
                    }
                  },
                ]);
                createTwoButtonAlert();
              }}
              {...props}
            >
              Logout
            </Icon.Button>
          </HStack>
        )}></AppBar>
        <ClinicInfo doctorName={doctorData.name} />
        {isClinicOpenToday() && (<SessionInfo clinicInfoData={clinicInfoData} />)}
      </View>
    );
  }
  else {
    // todo: add logout functionality as well
    function loginDataHandler(doctorDataDto: DoctorDataDTO) {
      setDoctorData(doctorDataDto);
      storage.set("doctorData", JSON.stringify(doctorDataDto));
    }

    return (<ClinicRegistration onLoginSuccessful={loginDataHandler} />);
  }
}

async function refreshDoctor(doctorId: string): Promise<{ status: boolean, data?: DoctorDataDTO }> {
  const resourceUrl = `${serverUrl}/doctor`
  try {
    const response = await fetch(`${resourceUrl}/${doctorId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    });
    if (response.status !== HttpStatusCode.OK) {
      return Promise.resolve({ status: false });
    }
    const responseJson = await response.json();
    return Promise.resolve({ status: true, data: responseJson.doctor });
  } catch (error) {
    console.error(`There was an error getting doctor with doctorId ${doctorId} from the server.`);
    // throw error; // todo: Add proper error handling
    return Promise.resolve({ status: false });
  }
}

export default App;
