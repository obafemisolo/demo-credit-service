import axios from "axios";
import { AppError } from "../../common/errors/AppError";
import Env from "../../config/Env";

export class AdjutorService {
  static async isBlacklisted(
    email: string,
    phoneNumber: string,
  ): Promise<boolean> {
    const identities = [email, phoneNumber];

    if (!Env.ADJUTOR_API_KEY.trim()) return false; //I might not get ADJUTOR_API_KEY for this assessment purpose

    for (const identity of identities) {
      const result = await this.checkKarma(identity);

      if (result) {
        return true;
      }
    }

    return false;
  }

  private static async checkKarma(identity: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `https://adjutor.lendsqr.com/v2/verification/karma/${identity}`,
        {
          headers: {
            Authorization: `Bearer ${Env.ADJUTOR_API_KEY}`,
            Accept: "application/json",
          },
        },
      );

      return (
        response.data?.status === "success" && Boolean(response.data?.data)
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }

      throw new AppError(502, "Unable to verify user blacklist status");
    }
  }
}
