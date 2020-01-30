import _got from 'got';
import accessEnv from '#root/helpers/accessEnv';

const got = _got.extend({ retry: 0, responseType: 'json' });

const LISTINGS_SERVOCE_URI = accessEnv('LISTINGS_SERVOCE_URI');

export default class ListingsService {
  static async fetchAllListings() {
    const body = await got.get(`${LISTINGS_SERVOCE_URI}/listings`).json();

    return body;
  }

  static async createListing({ description, title }) {
    //* 参数少，就透明点传递
    const body = await got.post(`${LISTINGS_SERVOCE_URI}/listings`, { json: { description, title } }).json();

    return body;
  }
}
