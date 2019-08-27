import React from 'react';
import { ScrollView, StyleSheet, View, FlatList, TouchableOpacity  } from 'react-native';
import { Input, Button, ListItem } from 'react-native-elements';
import { Text } from 'native-base';
import { client, gql } from '../services/ApolloService';
import { roomsStore } from '../stores/RoomsStore';
import { Notifications } from 'expo';

export class RoomsScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      rooms: [],
      roomName: ''
    }
  }
  createRoom = async () => {
    if (this.state.roomName.length === 0) return;

    try {
      await client.mutate({
        variables: {
          name: this.state.roomName,
          description: this.state.roomName
        },
        mutation: CREATE_ROOM
      });
      this.setState({roomName: ''});
    } catch (err) {
      console.log(err);
    }
  }

  componentDidMount() {
    roomsStore.init();
    roomsStore.rooms.subscribe((rooms) => {
      this.setState({rooms})
    })
    console.log(this.props);
    this._notificationSubscription = Notifications.addListener(this._handleNotification.bind(this));

  }

  _handleNotification = (notification) => {
    console.log(this.props);
    if (notification.origin === 'selected') {
      this.props.navigation.navigate('Chat');
      roomsStore.setCurrentRoom(notification.data.roomId);
    }

  }
  componentWillUnmount() {
    roomsStore.unsubscribe();
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
          placeholder="Room Name"
          onChangeText={(text) => this.setState({roomName: text})}
          value={this.state.roomName}
        />
        <Button
          onPress={() => this.createRoom()}
          style={{
            marginTop: 5,
            paddingLeft: '1%',
            paddingRight: '1%'
          }}
          title="CREATE"
          color="#fff"
        />


        <ScrollView
          style={{
            bottom: 0
          }}
        >
          <FlatList keyExtractor={this.keyExtractor} data={this.state.rooms} renderItem={this.renderItem} />

        </ScrollView>
      </View>
    );
  }

  keyExtractor = (item, index) => index.toString()

  renderItem = ({item, index}) => {
    return <TouchableOpacity
      onPress={() => {this.listItemPressed(item, index)}}
      style={{
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderTopWidth: index === 0 ? 2 : 0,
        borderColor: 'pink',
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 10,
        marginLeft: '1%',
        marginRight: '1%'
      }}><Text style={{
      fontSize: 16
    }}>{item.name}</Text></TouchableOpacity>
  }

  listItemPressed = (item, index) => {
    this.props.navigation.navigate('Chat');
    roomsStore.setCurrentRoom(item.id);
  }
}
const CREATE_ROOM = gql`
    mutation CreateRoom($name: String!, $description: String!){
        createRoom(
            name: $name
            description: $description
        ){
            id
            name
            description
            createdBy {
                name
            }
            members{
                name
            }
        }
    }
`
RoomsScreen.navigationOptions = {
  title: 'Rooms'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
