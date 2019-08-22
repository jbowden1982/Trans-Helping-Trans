import { createStackNavigator, createAppContainer } from "react-navigation";
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { Platform } from 'react-native';


const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {},
});

const OnBoardingStack = createStackNavigator(
  {
    Login: LoginScreen,
    SignUp: SignUpScreen
  },
  config
);

OnBoardingStack.path = '';

export const OnBoardingNavigator = createAppContainer(OnBoardingStack);

