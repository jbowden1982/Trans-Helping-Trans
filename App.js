import { AppLoading, Notifications } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppNavigator from './src/navigation/AppNavigator';
import { authStore } from './src/stores/AuthStore';
import { client, gql } from './src/services/ApolloService';
import { ApolloProvider } from '@apollo/react-hooks';
import { AsyncStorage } from 'react-native';
import { OnBoardingNavigator } from './src/navigation/OnBoardingNavigator';
import { userStore } from './src/stores/UserStore';
import * as Permissions from 'expo-permissions';
import { roomsStore } from './src/stores/RoomsStore';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoadingComplete: false,
      isAuthenticated: false
    }
  }

  componentDidMount() {
    this.isAuthenticatedSubscription = authStore.isAuthenticated.subscribe(
      (value) => {
        this.setState({isAuthenticated: value})
    })

  }

  componentWillUnmount() {
    this.isAuthenticatedSubscription.unsubscribe();
  }

  render() {
    const {
      isLoadingComplete,
      isAuthenticated
    } = this.state;

    const props = this.props;

    if (!isLoadingComplete && !props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this.loadResourcesAsync}
          onError={handleLoadingError}
          onFinish={() => this.setState({isLoadingComplete: true})}
        />
      );
    } else if (isAuthenticated) {
      return (
        <ApolloProvider client={client}>
          <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            <AppNavigator />
          </View>
        </ApolloProvider>
      );
    } else {
      return (
        <ApolloProvider client={client}>
          <View style={styles.container}>
            <OnBoardingNavigator />
          </View>
        </ApolloProvider>
      )
    }
  }
  loadResourcesAsync = async () => {
    const jwt = await AsyncStorage.getItem('jwt');

    if (jwt !== null) {
      authStore.jwt.next(jwt);
    } else {
      this.setState({isAuthenticated: false});
      authStore.isAuthenticated.next(false);
    }


    await Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Ionicons.font,
        // We include SpaceMono because we use it in ChatScreen.js. Feel free to
        // remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);

    setTimeout(async () => {
      try {
        const res = await userStore.getCurrentUser();
      } catch (err) {
        authStore.logout();
      }

      try {
        const user = await this.registerForPushNotificationsAsync();

      } catch (err) {
        console.log('in error');
        console.log(err);
      }
    }, 1000)

  }

  async registerForPushNotificationsAsync() {
    const {status: existingStatus} = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();

    // POST the token to your backend server from where you can retrieve it to send push notifications.
    try {
      let pushToken = await client.mutate({
        variables: {
          token
        },
        mutation: PUSH_TOKEN
      });
    } catch (err) {
      console.log(err);
    }

  }
}

const PUSH_TOKEN = gql`
    mutation PushToken($token: String!){
        pushToken(
            token: $token
        ){
            id
            name
        }
    }
`

function handleLoadingError(error) {
  // In this case, you might want to report the error to your error reporting
  // service, for example Sentry
  console.warn(error);
}

function handleFinishLoading(setLoadingComplete) {
  setLoadingComplete(true);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
