import { GraphQLError } from "graphql";
import { getDateAsNumericValue } from "./utility/Utility";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_EXPIRES_IN = 30 * 60 * 1000;
const REFRESH_TOKEN_EXPIRES_IN = 180 * 24 * 60 * 60 * 1000;

const token = () => {
    return{
        access(member) {
            return jwt.sign({
                member,
                iat: getDateAsNumericValue(0),
                exp: getDateAsNumericValue(ACCESS_TOKEN_EXPIRES_IN)
            }, process.env.ACCESS_TOKEN_SECRET);
        },
        refresh(member) {
            return jwt.sign({
                member,
                iat: getDateAsNumericValue(0),
                exp: getDateAsNumericValue(REFRESH_TOKEN_EXPIRES_IN)
            }, process.env.REFRESH_TOKEN_SECRET);
        },
        issuance(token) {
            return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                    if (err || decoded.exp < getDateAsNumericValue(0)) {
                        throw new GraphQLError('[renew] renew failed', { 
                            extensions: { 
                                http: { 
                                    status: 401, 
                                    code: 'INVALID_REFRESH_TOKEN', 
                                    message: '[renew] \'refreshToken\' is invalid' 
                                } 
                            } 
                        })
                    } else {
                        return {
                            exp: getDateAsNumericValue(ACCESS_TOKEN_EXPIRES_IN - 1000),
                            username: decoded.member.username,
                            renewedToken: this.access(decoded.member)
                        }
                    }
                }
            );
        }
    }
}

export const login = (member) => {
    return {
        accessToken : token().access(member),
        exp: getDateAsNumericValue(ACCESS_TOKEN_EXPIRES_IN - 1000),
        refreshToken : token().refresh(member)
    };
}

export const renew = (refreshToken) => {
    return token().issuance(refreshToken);
}