import { BehaviorSubject } from 'rxjs';
import { client, gql, setAuthorization } from '../services/ApolloService';
import { AsyncStorage } from 'react-native';
import { userStore } from './UserStore';


class AuthStore {
  isAuthenticated = new BehaviorSubject(false);
  username = new BehaviorSubject(null);
  password = new BehaviorSubject(null);
  jwt = new BehaviorSubject(null);

  constructor() {
    this.jwt.subscribe((value) => {
      if (value !== null) {
        try {
          setAuthorization(value);
          this.isAuthenticated.next(true);
        } catch (err) {
          this.isAuthenticated.next(false);
        }
      }
    })
  }

  async login() {
    try {
      const res = await client.mutate({
        variables: {
          username: this.username.value,
          password: this.password.value
        },
        mutation: LOGIN_USER
      });
      if (res.data.login.token) {
        userStore.username = res.data.login.user.username;
        userStore.name = res.data.login.user.name;
        userStore.email = res.data.login.user.email;
        await AsyncStorage.setItem('jwt', res.data.login.token);
        this.jwt.next(res.data.login.token);
        this.isAuthenticated.next(true);
      } else {
        this.isAuthenticated.next(false);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async signup({userName, email, fullName, password}) {
    const res = await client.mutate({
      variables: {
        username: userName,
        password: password,
        email: email,
        name: fullName
      },
      mutation: SIGNUP_USER
    });
    if (res.data.signup.token) {
      userStore.username = res.data.signup.user.username;
      userStore.name = res.data.signup.user.name;
      userStore.email = res.data.signup.user.email;
      await AsyncStorage.setItem( 'jwt', res.data.signup.token);
      this.jwt.next(res.data.signup.token);
      this.isAuthenticated.next( true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  logout() {
    this.jwt.next(null);
    this.username.next(null);
    this.password.next(null);
    AsyncStorage.removeItem('jwt');
    this.isAuthenticated.next(false);
  }
}

const LOGIN_USER = gql`
    mutation Login($username: String!, $password: String!){
        login(
            username: $username
            password:$password
        ){
            token
            user{
                username
                name
                email
            }
        }
    }
`


const SIGNUP_USER = gql`
    mutation SignUp($username: String!, $password: String!, $email: String!, $name: String!){
        signup(
            username: $username
            password:$password
            email:$email
            name:$name
        ){
            token
            user{
                username
                name
                email
            }
        }
    }
`

export const authStore = new AuthStore();

