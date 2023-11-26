import { GraphQLError } from "graphql";
import client from "../../client";  
import { validate } from "../../validators/Validator";
import { hashPassword } from "../../utility/Utility";

export default {
  Mutation: {
    /**
     * 회원가입
     * @param {string} username: 회원아이디
     * @param {string} password: 비밀번호
     * @param {string} fullName: 이름
     * @param {string} gender: 성별
     * @param {string} dateOfBirth: 생년월일
     * @returns 생성된 회원정보
     */
    createMember: async(_, { username, password, fullName, gender, dateOfBirth }) => {

      const validationResult = await validate([
        {
          object: username,
          name: {
            eng: "username",
            kor: "아이디"
          },
          type: "length",
          rules: {
            min: 6,
            max: 20
          }
        },
        {
          object: username,
          name: {
            eng: "username",
            kor: "아이디"
          },
          required: true,
          type: "pattern",
          rules: {
            expression: /^[A-Za-z0-9]+$/
          }
        },
        {
          object: username,
          name: {
            eng: "username",
            kor: "아이디"
          },
          required: true,
          type: "duplicacy",
          rules: {
            function: isUsernameDuplicate
          }
        },
        {
          object: password,
          name: {
            eng: "password",
            kor: "비밀번호"
          },
          required: true,
          type: "length",
          rules: {
            equals: 44
          }
        },
        {
          object: fullName,
          name: {
            eng: "fullName",
            kor: "이름"
          },
          required: true,
          type: "length",
          rules: {
            max: 10
          }
        },
        {
          object: gender,
          name: {
            eng: "gender",
            kor: "성별"
          },
          required: true,
          type: "options",
          message: "성별은(는) 남성, 여성, 선택안함 중 하나여야 합니다.",
          rules: {
            options: [
              "MALE",
              "FEMALE",
              "OTHER"
            ]
          }
        },
        {
          object: dateOfBirth,
          name: {
            eng: "dateOfBirth",
            kor: "생년월일"
          },
          reuqired: true,
          type: "dateFormat"
        }
      ]);

      if (validationResult.length) {
        const message = '[createMember] Validation failed';
        throw new GraphQLError(message, { extensions : { http: { status: 400, code: "VALIDATION_FAILURE", message, validationResult } } });
      }

      return client.Member.create({
        data: {
            username,
            password: hashPassword(username, password),
            fullName,
            gender,
            dateOfBirth
        }
      })
    },

    /**
     * 회원 정보 수정
     * @param {number} id: 회원 index
     * @param {string} password: 비밀번호
     * @param {string} fullName: 이름
     * @param {string} gender: 성별
     * @param {string} dateOfBirth: 생년월일
     * @returns 수정된 회원정보
     */
    updateMember: async (_, { id, password, fullName, gender, dateOfBirth }, { req }) => {

      const tokenId = req.user.member.id;
      const tokenUsername = req.user.member.username;

      if (!tokenId) {
        const message = '[updateMember] Token does not contain id'
        throw new GraphQLError(message, { extensions: { http: { status: 401, code: 'UNAUTHORIZED',  message } } })
    }

      if (id !== tokenId) {
        const message = "[updateMember] Token does not match provided memberId";
        throw new GraphQLError(message, { extensions: { http: { status: 401, code: 'UNAUTHORIZED', message } } })
      }

      const validationResult = await validate([
        {
          object: password,
          name: {
            eng: "password",
            kor: "비밀번호"
          },
          type: "length",
          rules: {
            equals: 44
          },
          message: "올바르지 않은 비밀번호입니다."
        },
        {
          object: fullName,
          name: {
            eng: "fullName",
            kor: "이름"
          },
          type: "length",
          rules: {
            max: 10
          }
        },
        {
          object: gender,
          name: {
            eng: "gender",
            kor: "성별"
          },
          type: "options",
          rules: {
            options: [
              "MALE",
              "FEMALE",
              "OTHER"
            ]
          },
          message: "성별은(는) 남성, 여성, 선택안함 중 하나여야 합니다.",
        },
        {
          object: dateOfBirth,
          name: {
            eng: "dateOfBirth",
            kor: "생년월일"
          },
          type: "dateFormat"
        }
      ]);

      if (validationResult.length) {
        const message = '[updateMember] Validation failed';
        throw new GraphQLError(message, { extensions : { http: { status: 400, code: "VALIDATION_FAILURE", message,  validationResult } } });
      }

      return client.Member.update({
        data: {
          password: hashPassword(tokenUsername, password),
          fullName,
          gender,
          dateOfBirth
        },
        where: {
          id
        }
      })
    },

    /** 
     * 회원 탈퇴 
     * @returns 회원탈퇴 성공 여부
     */
    deleteMember: async (_, __, { req }) => {
      const tokenId = req.user.member.id;

      if (!tokenId) {
        const message = '[deleteMember] Token does not contain id'
        throw new GraphQLError(message, { extensions: { http: { status: 401, code: 'UNAUTHORIZED',  message } } })
    }

      const result = await client.Member.delete({
        where: {
          id: tokenId
        }
      })

      return !!result;
    },
    
    /** 
     * 아이디 중복 검사
     * @param {string} username: 회원아이디
     * @returns 아이디 중복 여부
     */
    checkUsernameDuplicacy: async(_, { username }) => {
      return await isUsernameDuplicate(username);
    },

    /** 
     * 토큰의 아이디로 비밀번호 검사 
     * @param {string} password: 비밀번호
     * @returns 회원정보 일치 여부
     */
    passwordCheck: async(_, { password }, { req }) => {
      const tokenUsername = req.user.member.username;

      if (!tokenUsername) {
        const message = '[createSchedule] Token does not contain username'
        throw new GraphQLError(message, { extensions: { http: { status: 401, code: 'UNAUTHORIZED',  message } } })
    }

      const result = await client.Member.findFirst({
        where: {
          username: tokenUsername,
          password: hashPassword(tokenUsername, password)
        }
      })

      return !!result;
    }
  },
};

/**
 * 아이디 중복 검사 클라이언트 호출 
 * @param {string} username: 회원아이디
 * @returns 회원정보 일치 여부
 */
const isUsernameDuplicate = async (username) => {
  const result = await client.Member.findFirst({
    where: {
      username
    }
  })

  return !!result
}