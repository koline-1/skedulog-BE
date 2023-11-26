const { getTodayDateTimeAsString } = require("../utility/Utility");
const requestIp = require("request-ip");

/**
 * 로깅 미들웨어
 * @param {*} req request
 * @param {*} _ response (사용 안함)
 * @param {*} next next() function
 * @returns next() 실행
 */
export const logger = (req, _, next) => {
    const operationName = req.body.operationName;
    const method = req.method;
    const variables = req.body.variables;
    const query = req.body.query;
    const username = req.user?.member.username;
    const clientIp = requestIp.getClientIp(req);
    const accessTime = getTodayDateTimeAsString()

    if (operationName === 'IntrospectionQuery' || method === 'OPTIONS') return next();

    console.log("===================== Scanning Parameters =====================");
    clientIp &&      console.log("ACCESS IP ADDR : ", clientIp);
    username &&      console.log("USERNAME       : ", username);
    accessTime &&    console.log("ACCESS TIME    : ", accessTime);
    operationName && console.log("OPERATION NAME : ", operationName);
    method &&        console.log("METHOD         : ", method);
    variables &&     console.log("VARIABLES      : ", variables);
    query &&         console.log("QUERY          : ", query);
    console.log("======================= Finish Scanning =======================");

    return next();
}