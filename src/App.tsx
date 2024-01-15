/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  View
} from 'react-native';

import ClinicInfo, { isClinicOpenToday } from './ClinicInfo';
import SessionInfo from './SessionInfo';

function App(): React.JSX.Element {
  const doctorName = "Madnani";
  const clinicInfoData = {
    doctorName: doctorName,
  }
  return (
    <View>
      <ClinicInfo doctorName="Madnani" />
      {isClinicOpenToday() && (<SessionInfo clinicInfoData={clinicInfoData} />)}
    </View>
  );
}

export default App;
