import _got from 'got';
import accessEnv from '#root/helpers/accessEnv';

const got = _got.extend({ retry: 0, responseType: 'json' }); //! responseType 竟没用？

const USERS_SERVICE_URI = accessEnv('USERS_SERVICE_URI');

export default class UsersService {
  static async createUser({ email, password }) {
    const body = await got
      .post(`${USERS_SERVICE_URI}/users`, {
        json: { email, password },
      })
      .json();

    return body;
  }

  static async fetchUser({ userId }) {
    const body = await got.get(`${USERS_SERVICE_URI}/users/${userId}`).json();
    return body;
  }

  static async fetchUserSession({ sessionId }) {
    const body = await got.get(`${USERS_SERVICE_URI}/sessions/${sessionId}`).json();
    return body;
  }

  static async createUserSession({ email, password }) {
    const body = await got.post(`${USERS_SERVICE_URI}/sessions`, { json: { email, password } }).json();
    return body;
  }

  static async deleteUserSession({ sessionId }) {
    // 默认 retry=2， 收到500等错误时会重新连接两次。
    const body = await got.delete(`${USERS_SERVICE_URI}/sessions/${sessionId}`).json();
    return body;
  }
}
