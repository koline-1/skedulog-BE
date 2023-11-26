const crypto = require("crypto-js");
const dotenv = require('dotenv');

dotenv.config();

/**
 * 오늘 날짜를 'YYYY-MM-DD' 형태의 String으로 return
 * @returns 'YYYY-MM-DD' 형태의 String
 */
export const getTodayDateTimeAsString = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
}

/**
 * 비밀번호 암호화
 * @param password 암호화 대상 비밀번호
 * @returns 암호화 된 비밀번호
 */
export const hashPassword = (username, password) => {
    const algo = crypto.algo.SHA256.create();
    algo.update(crypto.SHA256(username));
    algo.update(crypto.SHA256(password));
    algo.update(crypto.SHA256(process.env.CRYPTO_SECRET_KEY_1));
    algo.update(crypto.SHA256(process.env.CRYPTO_SECRET_KEY_2));
    algo.update(crypto.SHA256(process.env.CRYPTO_SECRET_KEY_3));

    return algo.finalize().toString(crypto.enc.Base64);
}

/**
 * 현재시간을 getTIme 메소드를 이용해 numeric value로 파라미터 값을 더해 return
 * @param timeFromNow 현재 시간으로부터 계산할 milliseconds
 * @returns 더한 시간의 numeric value
 */
export const getDateAsNumericValue = (timeFromNow) => {
    const time = new Date().getTime()
    return (new Date()).getTime() + timeFromNow;
}