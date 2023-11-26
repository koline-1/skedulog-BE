import { GraphQLError } from "graphql";
import client from "../../client";

export default {
    Query: {
        /**
         * 고유번호로 단일 스케줄 조회 
         * @param {number} id: 스케줄 index
         * @param {string} createdAt: string 형태의 날짜
         * @returns 단일 스케줄 정보
         */
        schedule: (_, { id, createdAt }) => {
            return client.Schedule.findFirst({
                where: {
                    id
                },
                include: {
                    parent: {
                        include: {
                            parent: {
                                include: {
                                    parent: {
                                        include: {
                                            parent: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    units: true,
                    scheduleData: {
                        include: {
                            units: true,
                            scheduleData: {
                                include: {
                                    units: true
                                }
                            },
                            logData: {
                                include: {
                                    unit: true
                                },
                                where: {
                                    createdAt: createdAt ? {
                                        gte: new Date((createdAt) + 'T00:00:00Z'),
                                        lte: new Date((createdAt) + 'T23:59:59Z')
                                    } : undefined
                                }
                            },
                            createdBy: true,
                        }
                    },
                    logData: {
                        include: {
                            unit: true
                        },
                        where: {
                            createdAt: createdAt ? {
                                gte: new Date((createdAt) + 'T00:00:00Z'),
                                lte: new Date((createdAt) + 'T23:59:59Z')
                            } : undefined
                        }
                    },
                    createdBy: true
                }
            })
        },
        /** 
         * 작성자의 전체 스케줄 및 해당 날짜의 전체 로그 조회 
         * @param {string} createdBy: 생성 사용자 아이디
         * @param {string} createdAt: string 형태의 생성 일자
         * @returns 해당 사용자의 스케줄 및 로그 목록
         */
        allSchedulesByMember: async (_, { createdBy, createdAt }) => {

            const member = await client.Member.findFirst({
                where: {
                    username: createdBy
                }
            })

            if (!member) {
                const message = "[allSchedulesByMember] Member with provided username does not exist";
                throw new GraphQLError(message, { extensions: { http: { status: 404, code: "MEMBER_NOT_FOUND", message } } })
            }

            return client.Schedule.findMany({
                where: {
                    createdBy: { username: createdBy },
                    parent: null
                },
                include: {
                    parent: false,
                    units: true,
                    scheduleData: {
                        include: {
                            units: true,
                            logData: {
                                include: {
                                    unit: true
                                },
                                where: {
                                    createdAt: {
                                        gte: new Date((createdAt) + 'T00:00:00Z'),
                                        lte: new Date((createdAt) + 'T23:59:59Z')
                                    }
                                }
                            },
                            scheduleData: {
                                include: {
                                    units: true,
                                    logData: {
                                        include: {
                                            unit: true
                                        },
                                        where: {
                                            createdAt: {
                                                gte: new Date((createdAt) + 'T00:00:00Z'),
                                                lte: new Date((createdAt) + 'T23:59:59Z')
                                            }
                                        }
                                    },
                                    scheduleData: {
                                        include: {
                                            units: true,
                                            logData: {
                                                include: {
                                                    unit: true
                                                },
                                                where: {
                                                    createdAt: {
                                                        gte: new Date((createdAt) + 'T00:00:00Z'),
                                                        lte: new Date((createdAt) + 'T23:59:59Z')
                                                    }
                                                }
                                            },
                                            scheduleData: {
                                                include: {
                                                    units: true,
                                                    logData: {
                                                        include: {
                                                            unit: true
                                                        },
                                                        where: {
                                                            createdAt: {
                                                                gte: new Date((createdAt) + 'T00:00:00Z'),
                                                                lte: new Date((createdAt) + 'T23:59:59Z')
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    logData: {
                        include: {
                            unit: true
                        },
                        where: {
                            createdAt: {
                                gte: new Date((createdAt) + 'T00:00:00Z'),
                                lte: new Date((createdAt) + 'T23:59:59Z')
                            }
                        }
                    },
                    createdBy: true
                }
            })
        }
    }   
}