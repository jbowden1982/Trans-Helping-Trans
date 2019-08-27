import React from 'react';
import { ExpoConfigView } from '@expo/samples';
import { Button } from 'react-native-elements';
import { authStore } from '../stores/AuthStore';
import { roomsStore } from '../stores/RoomsStore';

export class SettingsScreen extends React.Component {

  render() {
    /**
     * Go ahead and delete ExpoConfigView and replace it with your content;
     * we just wanted to give you a quick view of your config.
     */
    return (
      <Button title="Log Out" onPress={this.onLogOut}></Button>
    );
  }

  onLogOut() {
    authStore.logout();
    roomsStore.reset();
  }
}

SettingsScreen.navigationOptions = {
  title: 'Settings',
};
