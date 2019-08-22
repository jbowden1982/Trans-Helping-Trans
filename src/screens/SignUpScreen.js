import React from 'react';
import { View } from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import { authStore } from '../stores/AuthStore';

export class SignUpScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Sign Up'
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      userName: '',
      email: '',
      fullName: '',
      password: ''
    }
  }

  componentDidMount() {
  }

  render() {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text h2={true}>Slim Chat</Text>
        <View style={{
          width: '90%'
        }}>
          <Input inputStyle={{paddingLeft: 10}}
                 autoCapitalize='none'
                 placeholder='User Name'
                 onChangeText={this.userNameChangeText}
                 value={this.state.userName}
          />
          <Input inputStyle={{paddingLeft: 10}}
                 autoCapitalize='none'
                 placeholder='Email'
                 onChangeText={this.emailChangeText}
                 value={this.state.email}
          />
          <Input inputStyle={{paddingLeft: 10}}
                 placeholder='Full Name'
                 onChangeText={this.fullNameChangeText}
                 value={this.state.fullName}
          />
          <Input secureTextEntry={true}
                 inputStyle={{paddingLeft: 10}}
                 placeholder='Password'
                 onChangeText={this.passwordChangeText}
          />
          <Button onPress={()=> authStore.signup(this.state)} style={{marginTop: 10, padding: 10}} title='Sign Up' />
        </View>
      </View>
    )
  }

  userNameChangeText = (text) => {
    this.setState({userName: text});

  };

  emailChangeText = (text) => {
    this.setState( {email: text});
  };

  fullNameChangeText = (text) => {
    this.setState({fullName: text});
  };

  passwordChangeText = (text) => {
    this.setState({password: text});

  }
}
