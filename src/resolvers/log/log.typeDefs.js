import { gql } from "apollo-server-express";

export default gql`
    type Query {
        """
        고유번호로 단일 로그 조회
        """
        log(id: Int!): Log
    }

    type Mutation {
        """
        로그 생성
        """
        createLog(value: Int!, unit: Int!, schedule: Int!): Log

        """
        로그 수정
        """
        updateLog(id: Int!, value: Int, unit: Int): Log

        """
        로그 삭제
        """
        deleteLog(id: Int!): Boolean!
    }

    """
    로그 타입
    """
    type Log {
        """
        로그 고유번호 (자동생성)
        """
        id: Int!

        """
        값
        """
        value: Int!

        """
        단위
        """
        unit: Unit!

        """
        스케줄 (로그가 속한 상위 객체)
        """
        schedule: Schedule!

        """
        로그 작성 회원
        """
        createdBy: Member!
        
        """
        로그 작성 날짜
        """
        createdAt: DateTime!

        """
        로그 수정 날짜
        """
        updatedAt: DateTime!
    }
`;