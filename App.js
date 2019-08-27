import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppNavigator from './src/navigation/AppNavigator';
import { authStore } from './src/stores/AuthStore';
import { client } from './src/services/ApolloService';
import { ApolloProvider } from '@apollo/react-hooks';
import { AsyncStorage } from 'react-native';
import { OnBoardingNavigator } from './src/navigation/OnBoardingNavigator';
import { userStore } from './src/stores/UserStore';

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
        console.log('auth sub')
        console.log(value);
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

    console.log(jwt);
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


    try {
      const res = await userStore.getCurrentUser();
    } catch (err) {
      authStore.logout();
    }
  }
}



function handleLoadingError(error) {
  // In this case, you might want to report the error to your error reporting
  // service, for example Sentry
  console.log('error')
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
