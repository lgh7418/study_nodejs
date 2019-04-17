## 29. Node.js의 패키지 매니저와 PM2

* pm2 설치

  `npm install pm2 -g`

* pm2로 수정 사항 자동 반영

  `pm2 start main.js --watch`

* pm2로 에러 탐지

  `pm2 log`


## 47. 출력정보에 대한 보안

* `npm init` 

    이 프로젝트로 패키지로 관리하겠다!

    package.json 파일이 생성됨

* `npm install -S sanitize-html`

  여기서 -S는 이 프로젝트에만 저 모듈을 설치하겠다는 의미

