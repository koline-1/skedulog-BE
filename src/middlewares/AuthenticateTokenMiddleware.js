import { getDateAsNumericValue } from "../utility/Utility";
const jwt = require('jsonwebtoken');
const excludedOperations = require('../json/ExcludedOperations.json');
const dotenv = require('dotenv');

/* dotenv 설정파일 config */
dotenv.config();

/**
 * JWT 토큰 검사 미들웨어
 * @param {*} req request
 * @param {*} _ response (사용 안함)
 * @param {*} next next() function
 * @returns next() 실행
 */
export const authenticateToken = (req, _, next) => {
    /* Preflight 요청 처리 */
    const method = req.method;
    if (method === 'OPTIONS') {
      return next();
    }
  
    /* 로그인 필요 없는 요청 */
    const operationName = req.body.operationName;
    if (excludedOperations.includes(operationName)) {
      return next();
    }
  
    /* 요청 header 에서 토큰 추출 */
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token && token !== 'null') {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (!err) {
          if (decoded.exp < getDateAsNumericValue(0)) {
            const error = {
              status: 401,
              message: "Access Token has expired",
              code: "EXPIRED_ACCESS_TOKEN"
            }
            req.err = error;
          } else {
            req.user = decoded;
          }

          return next();

        } else {
          const error = {
            status: 401,
            message: "Access Token is not verified",
            code: "INVALID_ACCESS_TOKEN"
          }
          req.err = error;
          return next();
        }
      });
    } else {
      const error = {
        status: 403,
        message: "Access Token is not provided",
        code: "ACCESS_TOKEN_NOT_PROVIDED"
      }
      req.err = error;
      return next();
    }
  };