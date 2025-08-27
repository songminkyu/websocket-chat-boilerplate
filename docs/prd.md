# 실시간 채팅 플랫폼 보일러플레이트 (Spring Boot & NestJS)

이 프로젝트는 실시간 채팅 애플리케이션을 신속하게 구축할 수 있도록 **Spring Boot**와 **NestJS** 기반의 백엔드 보일러플레이트를 각각 제공합니다. 프론트엔드는 **Next.js 15 버전 이상**을 사용하여 두 백엔드와 모두 통신할 수 있도록 설계되었습니다.

WebSocket과 **STOMP(Simple Text Oriented Messaging Protocol)**를 사용하여 실시간 양방향 통신을 구현하며, 개발자들이 비즈니스 로직에 더 집중할 수 있도록 핵심 채팅 기능을 미리 구현해 놓은 코드베이스를 제공하는 것을 목표로 합니다.

## 🚀 주요 기능

-   **듀얼 백엔드 지원**: Spring Boot와 NestJS 중 원하는 기술 스택을 선택하거나 비교하며 개발할 수 있습니다.
-   **실시간 메시징**: WebSocket과 STOMP를 통해 지연 시간이 짧은 실시간 메시지 송수신이 가능합니다.
-   **채팅방 기능**:
    -   채팅방 생성 및 목록 조회
    -   채팅방 입장 및 퇴장
    -   특정 채팅방으로 메시지 브로드캐스팅
-   **독립적인 아키텍처**: 각 백엔드 서버는 독립적으로 실행되므로, 프로젝트 요구사항에 맞춰 하나만 선택하여 사용할 수 있습니다.
-   **공용 프론트엔드**: 하나의 Next.js 프론트엔드 코드로 두 백엔드 서버와 모두 연동할 수 있습니다.

## 🏛️ 아키텍처

본 프로젝트는 2개의 독립적인 백엔드 서버와 1개의 공용 프론트엔드 클라이언트로 구성됩니다. 프론트엔드는 설정을 통해 접속할 백엔드 서버를 지정할 수 있습니다.

```aiignore
              +----------------------------------+
              |     Frontend (Next.js 15+)       |
              +----------------------------------+
                              |
               (WebSocket / STOMP Connection)
                              |
             +----------------+-----------------+
             |                                  |
+----------------v-----------------+ +----------------v------------------+
|      Backend 1 (Spring Boot)     | |       Backend 2 (NestJS)        |
|  - Java                         | |  - TypeScript                   |
|  - Spring WebSocket             | |  - NestJS WebSocket Gateway     |
|  - STOMP Message Broker         | |  - STOMP over WebSocket         |
+----------------------------------+ +-----------------------------------+



```

## 📂 프로젝트 구조
```aiignore
.
├── 📁 spring-boot-backend/     # Spring Boot 서버
│   ├── src/
│   └── build.gradle
│
├── 📁 nestjs-backend/          # NestJS 서버
│   ├── src/
│   └── package.json
│
└── 📁 frontend/                # Next.js 15+ 클라이언트
├── app/
└── package.json

```
---

## 🏁 시작하기

### 사전 요구사항

-   **Spring Boot**:
    -   Java 17 이상
    -   Maven 또는 Gradle
-   **NestJS**:
    -   Node.js 18.x 이상
-   **Frontend (Next.js 15+)**:
    -   Node.js 18.17 이상
    -   npm, yarn, or pnpm

### 1. Spring Boot 백엔드 실행

```bash
# spring-boot-backend 디렉토리로 이동
$ cd spring-boot-backend

# Maven을 사용하여 애플리케이션 실행
$ ./mvnw spring-boot:run
서버는 기본적으로 http://localhost:8080에서 실행됩니다. WebSocket STOMP 엔드포인트는 /ws 입니다.

2. NestJS 백엔드 실행
Bash

# nestjs-backend 디렉토리로 이동
$ cd nestjs-backend

# 의존성 설치
$ npm install

# 개발 모드로 애플리케이션 실행
$ npm run start:dev
서버는 기본적으로 http://localhost:3000에서 실행됩니다.

3. 프론트엔드 실행 (Next.js)
Bash

# frontend 디렉토리로 이동
$ cd frontend

# 의존성 설치
$ npm install

# 개발 서버 실행
$ npm run dev
Next.js 프론트엔드 애플리케이션은 기본적으로 http://localhost:3000에서 실행됩니다.

⚠️ 참고: NestJS 서버와 Next.js 개발 서버가 동일한 3000번 포트를 사용하므로, 둘 중 하나의 포트를 변경해야 합니다. (예: nestjs-backend/src/main.ts 파일에서 포트 변경)


메시지 흐름 예시
연결: 클라이언트는 서버의 WebSocket 엔드포인트로 STOMP 연결을 시작합니다.

구독: 연결 성공 후, 사용자가 특정 채팅방(예: roomId가 '123')에 입장하면 클라이언트는 /topic/public/123 경로를 구독합니다.

사용자 추가 알림: 클라이언트는 /app/chat.addUser 경로로 사용자가 입장했음을 알리는 메시지를 서버에 전송합니다. 서버는 이 메시지를 받아 해당 채팅방의 모든 구독자에게 "OO님이 입장하셨습니다"와 같은 시스템 메시지를 브로드캐스팅합니다.

메시지 전송: 사용자가 채팅을 입력하면 클라이언트는 /app/chat.sendMessage 경로로 채팅 내용을 담은 메시지를 서버에 전송합니다.

수신 및 브로드캐스팅: 서버는 이 메시지를 받아 /topic/public/123을 구독 중인 모든 클라이언트에게 전달합니다.

🌱 향후 개선 과제
이 보일러플레이트는 실시간 채팅의 핵심 기능에 집중하고 있습니다. 아래와 같은 기능들을 추가하여 더욱 발전시킬 수 있습니다.

[ ] 사용자 인증: WebSocket 연결 시 JWT 또는 세션 기반의 사용자 인증 추가

[ ] 메시지 영속화: 주고받은 메시지를 데이터베이스(RDB, NoSQL 등)에 저장

[ ] 1:1 다이렉트 메시지(DM): /queue 또는 사용자별 토픽을 이용한 개인 메시지 기능

[ ] 사용자 상태 관리: 온라인/오프라인 등 사용자 접속 상태 표시

[ ] 메시지 브로커 확장: Redis Pub/Sub 등을 외부 메시지 브로커로 사용하여 백엔드 서버 스케일 아웃 지원

[ ] 읽음 확인: 메시지 읽음 처리 기능

[ ] 파일 전송: 텍스트 외 이미지, 파일 등 전송 기능