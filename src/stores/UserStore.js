import { client, gql } from '../services/ApolloService';
class UserStore {

  constructor() {
    // this.getCurrentUser();
  }

  getCurrentUser() {
    return new Promise(async (resolve, reject) => {
      let data = await client.query({
        query: gql`
            query {
                currentUser {
                    name
                    rooms{
                        name
                    }
                }
            }
        `
      });

      console.log(data);
      resolve(data.data.rooms);
    })
  }
}

export const userStore = new UserStore();
