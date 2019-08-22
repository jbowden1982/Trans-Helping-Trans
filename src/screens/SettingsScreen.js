import React from 'react';
import { ExpoConfigView } from '@expo/samples';

export class SettingsScreen extends React.Component {

  render() {
    /**
     * Go ahead and delete ExpoConfigView and replace it with your content;
     * we just wanted to give you a quick view of your config.
     */
    return (
      <ExpoConfigView />
    );
  }
}

SettingsScreen.navigationOptions = {
  title: 'app.json',
};
