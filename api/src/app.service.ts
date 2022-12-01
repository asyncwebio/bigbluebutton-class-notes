import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  async getToken(): Promise<string | undefined> {
    try {
      const body = {
        expires_in: process.env.ASSEMBLY_AI_BROWSER_TOKEN_EXPIRE_IN,
      };
      const { data } = await axios({
        method: 'post',
        url: 'https://api.assemblyai.com/v2/realtime/token',
        headers: {
          'content-type': 'application/json',
          authorization: process.env.ASSEMBLY_AI_TOKEN,
        },
        data: body,
      });
      return data.token;
    } catch (error) {
      console.log(error);
    }
  }
  getEtherPadToken() {
    return {
      token: process.env.ETHER_PAD_TOKEN,
    };
  }
}
