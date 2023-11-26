import { gql } from 'apollo-server-express';

export default gql`
    type Mutation {
        """
        로그인 정보 확인 및 AccessToken & RefreshToken 발급
        """
        login(username: String!, password: String!): String!

        """
        로그아웃 처리
        """
        logout: Boolean!

        """
        AccessToken 갱신
        """
        renew(username: String!): String!
    }
`;