import { GraphQLError } from "graphql";
import client from "../../client";

export default {
    Query: {
        /** 고유번호 또는 이름으로 단일 단위 조회 (id가 우선순위) */
        unit: (_, { id, name }) => {

            if (!id && !name) {
                const message = '[unit] both \'id\' and \'name\' are null';
                throw new GraphQLError(message, { extensions: { http: { status: 403, code: 'FORBIDDEN',  message } } })
            }

            return client.Unit.findFirst({
                where: id ? {
                    id
                } : {
                    name
                }
            })
        }
    }
}