/**
 * 유효성 검사
 * {
 *  object(Object): 검사 대상
 *  name(string): { kor: 변수 이름 국문, eng: 변수 이름 영문 }
 *  type(string): 검사 메소드 (length, pattern, dateFormat, duplicacy, options)
 *  required?(boolean|undefined): false 일경우 값이 있어야 검사 없으면 안함, true일 경우 값이 없으면 fail(default: false)
 *  message?(string|undefined): 전달 될 경우 invalid 일 때 message custom
 *  rules?(Object|undefined): 검사 기준 {
 *      switch(type) {
 *          case "length" : min?(number|undefined): 최소값, max?(number|undefined): 최대값, equals?(number|undefined): 동치
 *          case "pattern" : expression(object): 정규식
 *          case "dateFormat": undefined: dateFormat의 경우 rules 필요 없음
 *          case "duplicacy": function(Function): DB에 접근하여 중복확인할 함수
 *          case "options": options([Object]): Array에 포함된 값중 object가 포함됬는지 검사 
 *      }
 *  }
 * }
 */

export const validate = async(target) => {
    const validationResult = []

    for (const each of target) {
        let result;
        if (each.required) {
            result = await process(each);
        } else {
            if (each.object) {
                result = await process(each);
            }
        }
        if (result) validationResult.push(result);
    };

    return validationResult
}

const dateRegExp = /^(?!0000)[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
  
const process = async(target) => {
    const object = target.object;
    const engName = target.name.eng;
    const korName = target.name.kor;
    const type = target.type;
    const message = target.message;

    if (!object || !engName || !korName || !type) {
        throw new Error("[validate] \"object\", \"name.eng\", \"name.kor\" and \"type\" are required fields")
    }

    switch (type) {
        case "length" : {
            const min = target.rules.min;
            const max = target.rules.max;
            const equals = target.rules.equals;
            const length = object.length;

            if (!min && !max && !equals) {
                throw new Error("[validate] At least one of \"min\", \"max\" and \"equals\" should be provided")
            }

            if (equals && length !== Number(equals)) {
                return fail(engName, "WRONG_INPUT", message ?? (korName + '은(는) ' + equals + '글자만 허용됩니다'));
            } else {
                if (min && length < min) {
                    return fail(engName, "WRONG_INPUT", message ?? (korName + '은(는) ' + min + '글자 이상이어야 합니다.'));
                }
                if (max && length > max) {
                    return fail(engName, "WRONG_INPUT", message ?? (korName + '은(는) ' + max + '글자 이하여야 합니다.'));
                }
            }

            return;
        }
        case "pattern" : {
            const expression = target.rules.expression;
            
            if (!expression) {
                throw new Error("[validate] \"expression\" has not been provided")
            }

            if (!expression.test(object)) { 
                return fail(engName, "WRONG_INPUT", message ?? (korName + '의 형식을 확인해 주세요.'));
            }
            return;
        } 
        case "dateFormat" : {
            if (!dateRegExp.test(object)) {
                return fail(engName, "WRONG_INPUT", message ?? (korName + '의 형식을 확인해 주세요.'));
            }
            return;
        }
        case "duplicacy" : {
            const fn = target.rules.function;

            if (!fn) {
                throw new Error("[validate] \"function\" has not been provided")
            }

            const result = await fn(object);
            if (result) {
                return fail(engName, "IS_DUPLICATE", message ?? ('이미 존재하는 ' + korName + '입니다.'));
            }
            return;
        }
        case "options" : {
            const options = target.rules.options;

            if (!options) {
                throw new Error("\"options\" has not been provided")
            } else if (!Array.isArray(options)) {
                throw new Error("[validate] \"options\" should be provided as an array of string")
            }

            if (!options.includes(object)) {
                return fail(engName, "WRONG_INPUT", message ?? (korName + '은(는) ' + options + ' 중 하나여야 합니다.'));
            }
            return;
        }
    }
}
  
const fail = (name, code, message) => {
    return {
        ok: false,
        error: {
            name: name,
            code: code,
            message: message
        }
    }
}