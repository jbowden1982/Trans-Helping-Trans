import React from 'react';
import { Button, Input, Text } from 'react-native-elements';
import { View } from 'react-native';
import { authStore } from '../stores/AuthStore';

export class LoginScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Login',
      headerRight: (
        <Button
          onPress={navigation.getParam('pushSignUp')}
          style={{marginRight: 5}}
          title="Sign Up"
          color="#fff"
        />
      ),
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({ pushSignUp: this._pushSignUp });
  }

  _pushSignUp = () => {
    this.props.navigation.navigate('SignUp');
  }

  render() {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text h2={true}>Trans Helping Trans</Text>
        <View style={{
          width: '90%'
        }}>
          <Input inputStyle={{paddingLeft: 10}}
                 autoCapitalize='none'
                 placeholder='User Name'
                 onChangeText={(text) => authStore.username.next(text)}

          />
          <Input secureTextEntry={true}
                 inputStyle={{paddingLeft: 10}}
                 placeholder='Password'
                 onChangeText={text => authStore.password.next(text)}
          />
          <Button onPress={()=> authStore.login()} style={{marginTop: 10, padding: 10}} title='Login' />
        </View>
      </View>
    )
  }
}

// LoginScreen.navigationOptions = {
//   title: 'Login',
// };
