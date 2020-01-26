import got from 'got';

const USERS_SERVOCE_URI = 'http://users-service:7101';

export default class UsersService {
  static async createUser({ email, password }) {
    const body = await got
      .post(`${USERS_SERVOCE_URI}/users`, {
        json: { email, password },
      })
      .json();

    return body;
  }

  static async fetchUser({ userId }) {
    const body = await got.get(`${USERS_SERVOCE_URI}/users/${userId}`).json();
    return body;
  }

  static async fetchUserSession({ sessionId }) {
    const body = await got.get(`${USERS_SERVOCE_URI}/sessions/${sessionId}`).json();
    return body;
  }

  static async createUserSession({ email, password }) {
    const body = await got.post(`${USERS_SERVOCE_URI}/sessions`, { json: { email, password } }).json();
    return body;
  }
}
