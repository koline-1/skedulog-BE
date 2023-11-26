import { GraphQLError } from "graphql";
import client from "../../client";

export default {
    Query: {
        /**
         * 고유번호로 단일 로그 조회 
         * @param {number} id: 로그 index
         * @returns 단일 로그 정보
         */
        log: (_, { id }) => {
            return client.Log.findFirst({
                where: {
                    id
                },
                include: {
                    unit: true,
                    schedule: {
                        include: {
                            logData: {
                                include: {
                                    unit: true
                                }
                            }
                        }
                    },
                    createdBy: true
                }
            })
        }
    }
}