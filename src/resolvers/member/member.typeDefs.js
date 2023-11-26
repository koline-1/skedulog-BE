import { gql } from "apollo-server-express";

export default gql`
    scalar DateTime
    scalar Date

    type Query {
        """
        토큰의 고유번호로 회원 정보 조회
        """
        member: Member
    }

    type Mutation {
        """
        회원가입
        """
        createMember(username: String!, password: String!, fullName: String!, gender: String!, dateOfBirth: Date!): Member

        """
        회원 정보 수정
        """
        updateMember(id: Int!, password: String, fullName: String, gender: String, dateOfBirth: Date): Member

        """
        회원 탈퇴
        """
        deleteMember: Boolean!

        """
        아이디 중복 검사
        """
        checkUsernameDuplicacy(username: String!): Boolean!

        """
        토큰의 아이디로 비밀번호 검사
        """
        passwordCheck(password: String!): Boolean!
    }

    """
    회원 타입
    """
    type Member {
        """
        회원 고유번호 (자동생성)
        """
        id: Int!

        """
        회원 아이디
        """
        username: String!

        """
        회원 비밀번호
        """
        password: String!

        """
        회원 이름
        """
        fullName: String!

        """
        회원 성별
        """
        gender: String!

        """
        회원 생년월일
        """
        dateOfBirth: Date!

        """
        회원가입 날짜
        """
        createdAt: DateTime!

        """
        회원정보 수정 날짜
        """
        updatedAt: DateTime!
    }
`;