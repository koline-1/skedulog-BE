import { gql } from 'apollo-server-express';

export default gql`

    type Query {
        """
        고유번호로 단일 스케줄 조회
        """
        schedule(id: Int!, createdAt: Date): Schedule

        """
        작성자의 전체 스케줄 및 해당 날짜의 전체 로그 조회
        """
        allSchedulesByMember(createdBy: String!, createdAt: Date!): [Schedule]
    }

    type Mutation {
        """
        스케줄 생성
        """
        createSchedule(name: String!, units: [Int], parent: Int): Schedule

        """
        스케줄 수정
        """
        updateSchedule(id: Int!, name: String, units: [Int]): Schedule

        """
        스케줄 및 하위 스케줄/로그 삭제
        """
        deleteSchedule(id: Int!): Boolean
    }

    """
    스케줄 타입
    """
    type Schedule {
        """
        스케줄 고유번호 (자동생성)
        """
        id: Int!

        """
        스케줄 명 (#(해쉬태그)로 시작)
        """
        name: String!

        """
        뎁스 (최대 5)
        """
        depth: Int!

        """
        사용 가능한 단위 (e.g. '회', 'kg', '분' 등) - 5개까지 허용
        """
        units: [Unit]

        """
        상위 객체
        """
        parent: Schedule

        """
        하위 스케줄 객체 - 10개까지 허용
        """
        scheduleData: [Schedule]

        """
        하위 로그 객체 - 20개까지 허용
        """
        logData: [Log]

        """
        스케줄 작성 회원
        """
        createdBy: Member!

        """
        스케줄 작성 날짜
        """
        createdAt: DateTime!

        """
        스케줄 수정 날짜
        """
        updatedAt: DateTime!
    }
`;