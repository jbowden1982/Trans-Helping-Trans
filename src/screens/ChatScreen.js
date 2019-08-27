import React from 'react';
import {
  FlatList,
  Text,
  View,
  Animated,
  Dimensions,
  Keyboard,
  TextInput,
  UIManager,
  StyleSheet
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { roomsStore } from '../stores/RoomsStore';
import { client, gql } from '../services/ApolloService';
import { Button, Input } from 'react-native-elements';
import { userStore } from '../stores/UserStore';

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
        <Animated.View style={[{
          marginBottom: 5,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: 'pink',
          transform: [{translateY: shift}]
        }]}>
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
    return (
      <View style={[styles.balloon, {
        backgroundColor: userStore.username === item.user.username ? '#ff00d2' : '#008bff',
        alignSelf: userStore.username === item.user.username ? 'flex-end' : 'flex-start'
      }]}>
        {userStore.username !== item.user.username ? <Text style={{
          fontSize: 14,
          color: 'pink',
          textAlign: 'left',
          marginRight: 10,
        }}>{item.user.username}</Text> : null}
        <Text style={{paddingTop: 5, color: 'white'}}>{item.text}</Text>
        <View
          style={[
            styles.arrowContainer,
            styles.arrowLeftContainer,
          ]}
        >
          <View style={styles.arrowLeft} />
        </View>
      </View>
  //     <View
  //   style={styles.fromMe}>
  //     <Text style={{
  //     fontSize: 14,
  //       color: 'purple',
  //       textAlign: 'right',
  //       marginRight: 10,
  //       marginBottom: 5
  //   }}>{item.user.username}</Text>
  // <Text style={{
  // fontSize: 16
  // }}>{item.text}</Text></View>
    )
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

const styles = StyleSheet.create({
  item: {
    marginVertical: 14,
    flexDirection: 'row'
  },
  itemIn: {
    marginLeft: 10
  },
  itemOut: {
    alignSelf: 'flex-end',
    marginRight: 10
  },
  balloon: {
    margin: 5,
    maxWidth: scale(500),
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    borderRadius: 20
  },
  arrowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1
  },
  arrowLeftContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  arrowLeft: {
    left: -20,
  }
});

