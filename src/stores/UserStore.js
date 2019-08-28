import { client, gql } from '../services/ApolloService';
import { observable } from 'mobx';

class UserStore {

  @observable username = '';
  @observable email = '';
  @observable name = '';

  getCurrentUser() {
    return new Promise(async (resolve, reject) => {
      try {
        let data = await client.query({
          query: gql`
              query {
                  currentUser {
                      username
                      email
                      name
                      rooms {
                          id
                          name
                      }
                  }
              }
          `
        });

        this.username = data.data.currentUser.username;
        this.name = data.data.currentUser.name;
        this.email = data.data.currentUser.email;
        resolve(data.data.rooms);
      } catch (err) {
        reject(err);
      }
    })
  }
}

export const userStore = new UserStore();
