import React from 'react';
import {
  FlatList,
  Text,
  View,
  Animated,
  Dimensions,
  Keyboard,
  TextInput,
  UIManager
} from 'react-native';
import { roomsStore } from '../stores/RoomsStore';
import { client, gql } from '../services/ApolloService';
import { Button, Input } from 'react-native-elements';

const { State: TextInputState } = TextInput;

export class ChatScreen extends React.Component {


  constructor(props) {
    super(props);

    this.state = {
      room: {
        messages: []
      },
      message: '',
      shift: new Animated.Value(0)
    }
  }
  postMessage = async () => {
    if (this.state.message.length === 0) return;

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
    this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow);
    this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.handleKeyboardDidHide);


    roomsStore.currentRoom.subscribe((room) => {
      this.setState({room});
    })
  }

  componentWillUnmount() {
    this.keyboardDidShowSub.remove();
    this.keyboardDidHideSub.remove();

    roomsStore.currentRoom.unsubscribe();
  }

  handleKeyboardDidShow = (event) => {
    const { height: windowHeight } = Dimensions.get('window');
    const keyboardHeight = event.endCoordinates.height;
    const currentlyFocusedField = TextInputState.currentlyFocusedField();
    UIManager.measure(currentlyFocusedField, (originX, originY, width, height, pageX, pageY) => {
      const fieldHeight = height;
      const fieldTop = pageY;
      const gap = (windowHeight - keyboardHeight) - (fieldTop + fieldHeight);
      if (gap >= 0) {
        return;
      }
      Animated.timing(
        this.state.shift,
        {
          toValue: gap,
          duration: 0,
          useNativeDriver: true,
        }
      ).start();
    });
  }

  handleKeyboardDidHide = (event) => {
    Animated.timing(
      this.state.shift,
      {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }
    ).start();
  }

  render() {
    const {
      shift
    } = this.state;

    return (
      <View style={{flex: 1}}>
        <FlatList
          ref={ref => this.scrollView = ref}
          onContentSizeChange={(contentWidth, contentHeight)=>{
            this.scrollView.scrollToEnd({animated: true});
          }}
          style={{
            // backgroundColor: 'red',
            bottom: 0,
            flexDirection: 'column',
            height: 'auto'
          }}
          keyExtractor={this.keyExtractor}
          data={this.state.room.messages}
          renderItem={this.renderItem}
        />
        <Animated.View style={[{marginBottom: 5, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: 'pink', transform: [{translateY: shift}] }]}>
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
        </Animated.View>
      </View>
    );
  }

  keyExtractor = (item, index) => index.toString()

  renderItem = ({item, index}) => {
    console.log(item)
    return <View
      style={{
        backgroundColor: 'pink',
        borderRadius: 20,
        borderWidth: 2,
        borderTopWidth: index === 0 ? 2 : 0,
        borderColor: 'pink',
        paddingTop: 15,
        paddingBottom: 15,
        paddingRight: 10,
        paddingLeft: 10,
        marginTop: 5,
        marginBottom: 5,
        // width: 'auto',
        marginLeft: '1%',
        alignSelf: 'flex-start',
        marginRight: '1%'
      }}>
      <Text style={{
        fontSize: 14,
        color: 'purple',
        textAlign: 'right',
        marginRight: 10,
        marginBottom: 5
      }}>{item.user.username}</Text>
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

