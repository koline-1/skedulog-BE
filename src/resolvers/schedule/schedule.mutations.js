import client from "../../client";
import { GraphQLError } from "graphql";
import { validate } from "../../validators/Validator";

export default {
    Mutation: {
        /**
         * 스케줄 생성
         * @param {string} name: 스케줄 이름
         * @param {Unit[]?} units (Optional): 맵핑될 단위 배열
         * @param {Schedule?} parent (Optional): 부모 스케줄
         * @returns 생성된 스케줄
         */
        createSchedule: async(_, { name, units, parent }, { req }) => {
            const tokenUsername = req.user.member.username;
            let depth;

            if (!tokenUsername) {
                const message = '[createSchedule] Token does not contain username';
                throw new GraphQLError(message, { extensions: { http: { status: 401, code: 'UNAUTHORIZED',  message } } });
            }

            if (parent) {
                const parentSchedule = await client.Schedule.findFirst({
                    where: {
                        id: parent
                    },
                    include: {
                        createdBy: true
                    }
                })

                if (parentSchedule.createdBy.username !== tokenUsername) {
                    const message = '[createSchedule] This user does not have authorization to create sub-schedule under the provided parent';
                    throw new GraphQLError(message, { extensions: { http: { status: 403, code: 'FORBIDDEN',  message } } });
                }

                depth = parentSchedule.depth + 1 || 1;

                if (depth > 5) {
                    const message = '[createSchedule] The requested depth exceeds the maximum allowed depth of 5';
                    throw new GraphQLError(message, { extensions: { http: { status: 400, code: 'MAX_DEPTH_EXCEEDED',  message } } });
                }
            }

            const validationResult = await validate([
                {
                    object: name,
                    name: {
                        kor: '제목',
                        eng: 'name'
                    },
                    type: 'length',
                    required: true,
                    rules: {
                        max: 21
                    }
                },
                {
                    object: name,
                    name: {
                        kor: '제목',
                        eng: 'name'
                    },
                    type: 'pattern',
                    required: true,
                    rules: {
                        expression: /^#[a-zA-Z0-9ㄱ-힣_]+$/
                    }
                },
                {
                    object: units,
                    name: {
                        kor: '단위',
                        eng: 'units'
                    },
                    type: 'length',
                    rules: {
                        max: 10
                    },
                    message: '단위는 최대 10개 까지 허용됩니다.'
                }
            ])

            if (validationResult.length) {
                const message = '[createSchedule] Validation failed';
                throw new GraphQLError(message, { extensions : { http: { status: 400, code: "VALIDATION_FAILURE", message, validationResult } } });
            }

            return client.Schedule.create({
                data: {
                    name,
                    units: units ? { connect: units.map(id => ({ id })) } : undefined,
                    parent: parent ? { connect: { id: parent } } : undefined,
                    createdBy: { connect: { username: tokenUsername } },
                    depth
                },
                include: {
                    parent: {
                        include: {
                            units: true
                        }
                    },
                    units: true,
                    createdBy: true
                }
            })
        },

        /** 
         * 스케줄 수정
         * @param {number} id: 스케줄 index
         * @param {string?} name (Optional): 이름
         * @param {Unit[]?} units (Optional): 맵핑될 단위 배열
         * @returns 수정된 스케줄
         */
        updateSchedule: async (_, { id, name, units }, { req }) => {
            const tokenUsername = req.user.member.username;

            if (!tokenUsername) {
                const message = '[updateSchedule] Token does not contain username';
                throw new GraphQLError(message, { extensions: { http: { status: 401, code: 'UNAUTHORIZED',  message } } });
            }

            const target = await client.Schedule.findFirst({
                where: {
                    id
                },
                include: {
                    createdBy: true
                }
            })

            if (!target) {
                const message = '[updateSchedule] Schedule does not exist';
                throw new GraphQLError(message, { extensions: { http: { status: 404, code: 'RESOURCE_NOT_FOUND',  message } } });
            }

            if (target.createdBy.username !== tokenUsername) {
                const message = '[updateSchedule] This user does not have authorization to udpate this schedule';
                throw new GraphQLError(message, { extensions: { http: { status: 403, code: 'FORBIDDEN',  message } } });
            }

            const validationResult = await validate([
                {
                    object: name,
                    name: {
                        kor: '제목',
                        eng: 'name'
                    },
                    type: 'length',
                    rules: {
                        max: 21
                    }
                },
                {
                    object: name,
                    name: {
                        kor: '제목',
                        eng: 'name'
                    },
                    type: 'pattern',
                    rules: {
                        expression: /^#[a-zA-Z0-9ㄱ-힣_]+$/
                    }
                },
                {
                    object: units,
                    name: {
                        kor: '단위',
                        eng: 'units'
                    },
                    type: 'length',
                    rules: {
                        max: 10
                    },
                    message: '단위는 최대 10개 까지 허용됩니다.'
                }
            ])

            if (validationResult.length) {
                const message = '[updateSchedule] Validation failed';
                throw new GraphQLError(message, { extensions : { http: { status: 400, code: "VALIDATION_FAILURE", message, validationResult } } });
            }

            return client.Schedule.update({
                data: {
                    name,
                    units: units ? { set: units.map(id => ({ id })) } : undefined
                },
                where: {
                    id
                }
            })
        },

        /**
         * 스케줄 및 하위 스케줄/로그 삭제 
         * @param {number} id: 스케줄 index
         * @returns 삭제 성공 여부
         */
        deleteSchedule: async (_, { id }, { req }) => {
            const tokenUsername = req.user.member.username;

            if (!tokenUsername) {
                const message = '[deleteSchedule] Token does not contain username'
                throw new GraphQLError(message, { extensions: { http: { status: 401, code: 'UNAUTHORIZED',  message } } })
            }

            const target = await client.Schedule.findFirst({
                where: {
                    id
                },
                include: {
                    createdBy: true
                }
            })

            if (!target) {
                const message = '[deleteSchedule] Schedule does not exist'
                throw new GraphQLError(message, { extensions: { http: { status: 404, code: 'RESOURCE_NOT_FOUND',  message } } })
            }

            if (target.createdBy.username !== tokenUsername) {
                const message = '[deleteSchedule] This user does not have authorization to delete this schedule'
                throw new GraphQLError(message, { extensions: { http: { status: 403, code: 'FORBIDDEN',  message } } })
            }

            return !!(await client.Schedule.delete({
                where: {
                    id
                }
            }))
        }
    }   
}