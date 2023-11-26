import { GraphQLError } from 'graphql';
import client from '../../client';
import { login, renew } from '../../jwt'
import { hashPassword } from '../../utility/Utility';

export default {
    Mutation: {
        /**
         * 로그인 정보 확인 및 AccessToken & RefreshToken 발급 
         * @param {string} username: 회원 아이디 
         * @param {string} password: 회원 비밀번호
         * @returns 발급된 accessToken
         */
        login: async (_, { username, password }, { res }) => {
            const member = await client.Member.findFirst({
                where: {
                    username,
                    password: hashPassword(username, password)
                }
            })

            if (!member) {
                const message = '[login] Member matching provided information does not exist';
                throw new GraphQLError(message, { extensions: { http: { status: 404, code: 'LOG_IN_FAILURE', message } } })
            }

            const result = {
                tokens: login({
                    id: member.id,
                    username: member.username
                })
            };

            const refreshToken = result.tokens.refreshToken;
            
            await res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 180 * 24 * 60 * 60 * 1000,
                path: '/',
                domain: 'localhost',
                secure: true,
                sameSite: "none",
            })

            await client.Member.update({
                data: {
                    refreshToken
                },
                where: {
                    id: member.id
                }
            })
            
            return  JSON.stringify({ accessToken: result.tokens.accessToken, exp: result.tokens.exp });
        },

        /**
         * 회원을 로그아웃 처리한다.
         * 쿠키의 refreshToken 무효화 및 회원정보의 refreshToken 정보 삭제
         * @returns 로그아웃 성공 여부
         */
        logout: async(_, __, { req, res }) => {
            if (req.cookies) {
                await res.cookie("refreshToken", '', {
                    httpOnly: true,
                    maxAge: 0,
                    path: '/',
                    domain: 'localhost',
                    secure: true,
                    sameSite: "none",
                })
            } else {
                return false
            }
            
            await client.Member.update({
                data: {
                    refreshToken: ''
                },
                where: {
                    id: req.user.member.id
                }
            })

            return true;
        },
        
        /** 
         * AccessToken을 갱신한다.
         * @param {string} 토큰을 갱신할 계정 아이디
         * @returns 갱신된 accessToken
         */
        renew: async (_, { username }, { req }) => {
            const member = await client.Member.findFirst({
                where: {
                    username
                }
            });

            const cookieToken = req.cookies.refreshToken;

            if (cookieToken !== member.refreshToken) {
                const message = '[renew] This token is not authorized for token renewal';
                throw new GraphQLError(message, { extensions: { http: { status: 401, code: 'UNAUTHORIZED_REFRESH_TOKEN', message } } })
            }

            return JSON.stringify(renew(cookieToken));
        }
    }
};