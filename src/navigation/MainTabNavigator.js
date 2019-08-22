import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import { ChatScreen } from '../screens/ChatScreen';
import { RoomsScreen } from '../screens/RoomsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {},
});

const ChatStack = createStackNavigator(
  {
    Chat: ChatScreen,
  },
  config
);

ChatStack.navigationOptions = {
  tabBarLabel: 'Chat',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

ChatStack.path = '';

const RoomsStack = createStackNavigator(
  {
    Rooms: RoomsScreen,
  },
  config
);

RoomsStack.navigationOptions = {
  tabBarLabel: 'Rooms',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'} />
  ),
};

RoomsStack.path = '';

const SettingsStack = createStackNavigator(
  {
    Settings: SettingsScreen,
  },
  config
);

SettingsStack.navigationOptions = {
  tabBarLabel: 'Settings',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'} />
  ),
};

SettingsStack.path = '';

const tabNavigator = createBottomTabNavigator({
    RoomsStack,
    ChatStack,
    SettingsStack
});

tabNavigator.path = '';

export default tabNavigator;
