import got from "got";

const USERS_SERVOCE_URI = "http://users-service:7101";

export default class UsersService {
  static async createUser({ email, password }) {
    const body = await got.post(`${USERS_SERVOCE_URI}/users`, {
      json: { email, password }
    }).json();

    return body;
  }
}
