/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  View
} from 'react-native';

import ClinicInfo, { isClinicOpenToday } from './ClinicInfo';
import SessionInfo from './SessionInfo';
import ClinicRegistration from './ClinicRegistration';
import { MMKV } from 'react-native-mmkv'

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
    return (
      <View>
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

    return (<ClinicRegistration onLoginSuccessful={loginDataHandler}/>);
  }
}

export default App;
