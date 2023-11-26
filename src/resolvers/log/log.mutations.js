import client from "../../client";
import { GraphQLError } from "graphql";

export default {
    Mutation: {
        /**
         * 로그 생성
         * @param {number} value: 로그의 값
         * @param {Unit} unit: 로그와 맵핑될 단위
         * @param {Schedule} shedule: 로그의 부모 스케줄
         * @returns 생성된 로그
         */
        createLog: async (_, { value, unit, schedule }, { req }) => {
            const tokenUsername = req.user.member.username;

            if (!tokenUsername) {
                const message = '[createLog] Token does not contain username';
                throw new GraphQLError(message, { extensions: { http: { status: 401, code: 'UNAUTHORIZED',  message } } });
            }

            const parentSchedule = await client.Schedule.findFirst({
                where: {
                    id: schedule
                },
                include: {
                    createdBy: true
                }
            })

            if (!parentSchedule) {
                const message = '[createLog] Schedule does not exist';
                throw new GraphQLError(message, { extensions: { http: { status: 404, code: 'RESOURCE_NOT_FOUND',  message } } });
            }

            if (parentSchedule.createdBy.username !== tokenUsername) {
                const message = '[createLog] This user does not have authorization to create log under the provided parent';
                throw new GraphQLError(message, { extensions: { http: { status: 403, code: 'FORBIDDEN',  message } } });
            }

            return client.Log.create({
                data: {
                    value,
                    unit: { connect: { id: unit } },
                    schedule: { connect: { id: schedule } },
                    createdBy: { connect: { username: tokenUsername } }
                },
                include: {
                    unit: true,
                    schedule: {
                        include: {
                            parent: true,
                            units: true,
                            createdBy: true
                        }
                    },
                    createdBy: true
                }
            })
        },

        /**
         * 로그 수정
         * @param {number} id: 로그 index
         * @param {number} value: 로그의 값
         * @param {Unit} unit: 로그와 맵핑될 unit
         * @returns 수정된 로그
         */
        updateLog: async (_, { id, value, unit }, { req }) => {
            const tokenUsername = req.user.member.username;

            if (!tokenUsername) {
                const message = '[updateLog] Token does not contain username';
                throw new GraphQLError(message, { extensions: { http: { status: 401, code: 'UNAUTHORIZED',  message } } });
            }

            const target = await client.Log.findFirst({
                where: {
                    id
                },
                include: {
                    createdBy: true
                }
            })

            if (!target) {
                const message = '[updateLog] Log does not exist';
                throw new GraphQLError(message, { extensions: { http: { status: 404, code: 'RESOURCE_NOT_FOUND',  message } } });
            }

            if (target.createdBy.username !== tokenUsername) {
                const message = '[updateLog] This user does not have authorization to update this log';
                throw new GraphQLError(message, { extensions: { http: { status: 403, code: 'FORBIDDEN',  message } } });
            }

            return client.Log.update({
                data: {
                    value,
                    unit: unit ? { connect: { id: unit } } : undefined
                },
                where: {
                    id
                },
                include: {
                    unit: true
                }
            })
        },

        /** 
         * 로그 삭제
         * @param {number} id: 로그 index
         * @returns 로그 삭제 성공 여부
         */
        deleteLog: async (_, { id }, { req }) => {
            const tokenUsername = req.user.member.username;

            if (!tokenUsername) {
                const message = '[deleteLog] Token does not contain username';
                throw new GraphQLError(message, { extensions: { http: { status: 401, code: 'UNAUTHORIZED',  message } } });
            }

            const target = await client.Log.findFirst({
                where: {
                    id
                },
                include: {
                    createdBy: true
                }
            })

            if (!target) {
                const message = '[deleteLog] Log does not exist';
                throw new GraphQLError(message, { extensions: { http: { status: 404, code: 'RESOURCE_NOT_FOUND',  message } } });
            }

            if (target.createdBy.username !== tokenUsername) {
                const message = '[deleteLog] This user does not have authorization to delete this log';
                throw new GraphQLError(message, { extensions: { http: { status: 403, code: 'FORBIDDEN',  message } } });
            }
            
            return !!(await client.Log.delete({
                where: {
                    id
                }
            }))
        }
    }   
}