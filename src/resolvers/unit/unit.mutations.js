import { GraphQLError } from "graphql";
import client from "../../client";
import { validate } from "../../validators/Validator";

export default {
    Mutation: {
        /** 단위 생성 - 이미 존재하는 단위일 경우 create하지 않고 존재하는 객체 return */
        createUnit: async (_, { name }) => {

            const isUnitExist = await client.Unit.findFirst({
                where: {
                    name
                }
            })

            if (isUnitExist) {
                const message = '[createUnit] unit with provided name already exists';
                throw new GraphQLError(message, { extensions : { http: { status: 409, code: "CONFLICT", message } } });
            }

            const validationResult = await validate([
                {
                    object: name,
                    name: {
                        kor: '단위',
                        eng: 'unit'
                    },
                    type: 'length',
                    required: true,
                    rules: {
                        max: 10
                    }
                },
                {
                    object: name,
                    name: {
                        kor: '단위',
                        eng: 'unit'
                    },
                    type: 'pattern',
                    required: true,
                    rules: {
                        expression: /^[a-zA-Z0-9ㄱ-힣_"'\/\-`+=$!%~^&*()<>[\]{}?]+$/
                    }
                }
            ])

            if (validationResult.length) {
                const message = '[createUnit] validation failed';
                throw new GraphQLError(message, { extensions: { http: { status: 400, code: 'VALIDATION_FAILURE', message, validationResult } } })
            }

            return client.Unit.create({
                data: {
                    name
                },
                include: {
                    schedules: false,
                    logs: false
                }
            })
        }
    }
}