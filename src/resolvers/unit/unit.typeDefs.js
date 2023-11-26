import { gql } from "apollo-server-express";

export default gql`

    type Query {
        """
        고유번호 또는 이름으로 단일 단위 조회 (id가 우선순위)
        """
        unit(id: Int, name: String): Unit
    }

    type Mutation {
        """
        단위 생성 - 이미 존재하는 단위일 경우 create하지 않고 존재하는 객체 return
        """
        createUnit(name: String!): Unit
    }

    """
    단위 타입
    """
    type Unit {
        """
        단위 고유번호 (자동생성)
        """
        id: Int!

        """
        단위명
        """
        name: String!

        """
        스케줄 목록
        """
        schedules: [Schedule]

        """
        로그 목록
        """
        logs: [Log]
    }
`;