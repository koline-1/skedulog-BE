import { GraphQLError } from "graphql";
import client from "../../client";

export default {
  Query: {
    /**
     * 토큰의 고유번호로 회원 정보 조회 
     * @returns 회원정보
     */
    member: (_, __, { req }) => {
      const id = req.user.member.id;

      if (!id) {
        const message = '[member] \'id\' is null';
        throw new GraphQLError(message, { extensions: { http: { status: 401, code: 'UNAUTHORIZED',  message } } })
      }

      return client.Member.findFirst({
          where: {
            id,
          },
      });
    },
  },
};