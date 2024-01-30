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

export interface RegistrationData {
  doctorName: string;
  schedule: string;
}

export type ClinicInfoData = RegistrationData;

function App(): React.JSX.Element {
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  useEffect(() => {
    
      const savedRegistrationData: any = storage.getString("registrationData");
      if (savedRegistrationData) {
        setRegistrationData(JSON.parse(savedRegistrationData));
      }
    
  }, []);

  if (registrationData && registrationData.doctorName && registrationData.schedule) {

    const clinicInfoData: ClinicInfoData = {
      doctorName: registrationData.doctorName,
      schedule: registrationData.schedule
    }
    return (
      <View>
        <ClinicInfo doctorName={registrationData.doctorName} />
        {isClinicOpenToday() && (<SessionInfo clinicInfoData={clinicInfoData} />)}
      </View>
    );
  }
  else {
    function registrationHandler(doctorName: string, schedule: string) {
      const registrationData: RegistrationData = {
        doctorName: doctorName,
        schedule: schedule
      }
      setRegistrationData(registrationData);
      storage.set("registrationData", JSON.stringify(registrationData));
    }

    return (<ClinicRegistration onSubmit={registrationHandler}/>);
  }
}

export default App;
