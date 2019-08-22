import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { roomsStore } from '../stores/RoomsStore';
import { MonoText } from '../components/StyledText';
import { client, gql } from '../services/ApolloService';
import { Button, Input } from 'react-native-elements';
import { RoomsScreen } from './RoomsScreen';

export class ChatScreen extends React.Component {


  constructor(props) {
    super(props);

    this.state = {
      room: {
        messages: []
      },
      message: ''
    }
  }
  postMessage = async () => {
    try {
      await client.mutate({
        variables: {
          text: this.state.message,
          roomId: this.state.room.id,
        },
        mutation: POST_MESSAGE
      });
      this.setState({message: ''});
    } catch (err) {
      console.log(err);
    }
  }

  componentDidMount() {
    roomsStore.currentRoom.subscribe((room) => {
      this.setState({room});
    })
  }

  componentWillUnmount() {
    roomsStore.currentRoom.unsubscribe();
  }

  render() {
    return (
      <View style={{flex: 1}}>

        <Input
          containerStyle={{
            marginTop: 10,
            marginBottom  : 10,
            paddingLeft: '1%',
            paddingRight: '1%'
          }}
          placeholder="Enter message..."
          onChangeText={(text) => this.setState({message: text})}
          value={this.state.message}
        />
        <Button
          onPress={() => this.postMessage()}
          style={{
            marginTop: 5,
            paddingLeft: '1%',
            paddingRight: '1%'
          }}
          title="POST"
          color="#fff"
        />
        <ScrollView
          style={{
            bottom: 0,
          }}
        >
          <FlatList
            keyExtractor={this.keyExtractor}
            data={this.state.room.messages}
            renderItem={this.renderItem}
          />

        </ScrollView>
      </View>
    );
  }

  keyExtractor = (item, index) => index.toString()

  renderItem = ({item, index}) => {
    console.log(item)
    return <View
      style={{
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderTopWidth: index === 0 ? 2 : 0,
        borderColor: 'pink',
        paddingTop: 15,
        paddingBottom: 15,
        paddingRight: 10,
        paddingLeft: 10,
        marginLeft: '1%',
        marginRight: '1%'
      }}>
      <Text style={{
        fontSize: 14,
        color: 'purple',
        textAlign: 'right',
        marginRight: 10,
        marginBottom: 5
      }}>{item.owner.username}</Text>
      <Text style={{
      fontSize: 16
    }}>{item.text}</Text></View>
  }
}
const POST_MESSAGE = gql`
    mutation PostMessage($text: String!, $roomId: ID!){
        postMessage(
            text: $text
            roomId: $roomId
        ){
            id
        }
    }
`
ChatScreen.navigationOptions = {
  title: 'Chat'
};

