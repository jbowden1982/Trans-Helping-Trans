import { client, gql } from '../services/ApolloService';
import { BehaviorSubject, Subject } from 'rxjs';

class RoomsStore {
  rooms = new BehaviorSubject([]);
  currentRoom = new BehaviorSubject({messages: []});
  _roomsSubscription = null;

  async init() {
    const rooms = await this.getRooms();
    this.rooms.next(this.rooms.value.concat(rooms));
    if (this._roomsSubscription) {
      console.log('unsubscribing');
      this._roomsSubscription.unsubscribe();
      this._roomsSubscription = null;
    }
    this._roomsSubscription = this._subscribeToNewRoom();
    return this.rooms;
  }

  reset() {
    this.rooms = new BehaviorSubject([]);
  }
  unsubscribe() {
  }

  getRooms() {
    return new Promise(async (resolve, reject) => {
      let data = await client.query({
        query: gql`
            query {
                rooms {
                    id
                    name
                    description
                    members{
                        name
                    }
                    messages{
                        id
                        text
                        user {
                            id
                            username
                        }
                    }
                    
                }
            }
        `
      });

      resolve(data.data.rooms);
    })
  }

  async joinRoom(roomId) {
    const room = await client.mutate({
      variables: {
        roomId
      },
      mutation: JOIN_ROOM
    })
  }

  setCurrentRoom(roomId) {
    return new Promise(async (resolve, reject) => {
      this.joinRoom(roomId);
      let updatedRoom = await client.query({
        variables: {
          roomId: roomId,
          orderBy: "createdAt_ASC"
        },
        query: gql`
            query Room($roomId: ID!, $orderBy: String){
                room(
                    roomId: $roomId
                ){
                    id
                    name
                    messages(
                        orderBy: $orderBy
                    ){
                        id
                        text
                        user {
                            id
                            username
                        }
                    }
                }
            }
        `
      });

      this.currentRoom.next(updatedRoom.data.room);
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }
      this.subscription = this._subscribeToRoom(updatedRoom.data.room)
    })
  }

  _subscribeToRoom(room) {
    return client.subscribe({
      variables: {
        roomId: room.id
      },
      query: gql`
          subscription Messages($roomId: ID!){
              messages(
                  roomId: $roomId
              ){
                  id
                  text
                  user {
                      username
                  }
              }
          }
      `
    }).subscribe((response) => {
      const updatedRoom = this.currentRoom.value;
      updatedRoom.messages = updatedRoom.messages.concat(response.data.messages);
      this.currentRoom.next(updatedRoom)

    })
  }

  _subscribeToNewRoom() {
    return client.subscribe({
      query: gql`
          subscription {
              newRoom {
                  id
                  name
                  members{
                      name
                  }
              }
          }
      `
    }).subscribe((res) => {
      this.rooms.next([res.data.newRoom].concat(this.rooms.value));
    })
  }
}

const JOIN_ROOM = gql`
    mutation JoinRoom($roomId: String!){
        joinRoom(
            roomId: $roomId
        ){
            id
            name
            members{
                name
            }
        }
    }
`

export const roomsStore = new RoomsStore();
