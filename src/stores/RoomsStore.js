import { client, gql } from '../services/ApolloService';
import { BehaviorSubject, Subject } from 'rxjs';

class RoomsStore {
  rooms = new BehaviorSubject([]);
  currentRoom = new BehaviorSubject({messages: []});
  _roomsSubscription = null;

  async init() {
    const rooms = await this.getRooms();
    this.rooms.next(this.rooms.value.concat(rooms));
    this._roomsSubscription = await this._subscribeToNewRoom();
    return this.rooms;
  }

  unsubscribe() {
    this._roomsSubscription.unsubscribe();
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

  setCurrentRoom(room) {
    return new Promise(async (resolve, reject) => {
      console.log(room.id);
      let updatedRoom = await client.query({
        variables: {
          roomId: room.id,
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

      console.log(updatedRoom.data.room)
      this.currentRoom.next(updatedRoom.data.room);
      this._subscribeToRoom(updatedRoom.data.room)
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
      console.log(response)
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

export const roomsStore = new RoomsStore();
