import { BehaviorSubject } from 'rxjs';
import { client, gql, setAuthorization } from '../services/ApolloService';
import { AsyncStorage } from 'react-native';


class AuthStore {
  isAuthenticated = new BehaviorSubject(false);
  username = new BehaviorSubject('aria.bowden@icloud.com');
  password = new BehaviorSubject('grx78941');
  jwt = new BehaviorSubject(null);

  constructor() {
    this.jwt.subscribe((value) => {
      if (value !== null) {
        try {
          setAuthorization(value);
          this.isAuthenticated.next(true);
        } catch (err) {
          console.log("IN ERROR");

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
        this.isAuthenticated.next(true);
        await AsyncStorage.setItem('jwt', res.data.login.token);
        this.jwt.next(res.data.login.token);
        console.log('if');
      } else {
        console.log('else')
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
      this.isAuthenticated.next( true);
      await AsyncStorage.setItem( 'jwt', res.data.signup.token);
      this.jwt.next(res.data.signup.token);

    } else {
      this.isAuthenticated.next(false);
    }
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
                name
                email
            }
        }
    }
`

export const authStore = new AuthStore();

