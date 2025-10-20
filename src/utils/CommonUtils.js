import { API_RES_CODE, } from '../component/AppConstants';

// eslint-disable-next-line import/no-anonymous-default-export
export default {


    // 서버연동결과 오류팝업 
    showServerErr(code, msg = '') {
        let message = '';

        if (msg === '') {
            switch (code) {
                case API_RES_CODE.ERR_NETWORK:
                    message = "네트워크 연결이 원활하지 않습니다.\n잠시 후 다시 이용해 주세요.";
                    alert(message);
                    break;
                case API_RES_CODE.ERR_SERVICE:
                    message = "서비스 점검 중입니다\n보다 나은 서비스를 제공하기 위해 현재 서비스를 점검 중입니다";
                    alert(message);
                    break;
                case API_RES_CODE.ERR_DUP_LOGIN:
                    message = "자동 로그아웃 되었습니다\n회원님의 계정이 다른 기기에 연결되어 현재 연결을 종료합니다";
                    alert(message);
                    window.location.href="/login";
                    break;
                case API_RES_CODE.ERR_INVALID_MEMBER:
                    message = "아이디가 없거나 비밀번호가 일치하지 않습니다.";
                    alert(message);
                    break;
                case API_RES_CODE.ERR_INVALID_SNS:
                    message = "동일한 SNS계정이 존재합니다. 다시 로그인하십시오.";
                    alert(message);
                    window.location.href="/login";
                    break;
                case API_RES_CODE.ERR_IMPROPER_SNS:
                    message = "SNS사용자 등록정보가 부족합니다. 일반회원으로 가입하십시오.";
                    alert(message);
                    break;
                case API_RES_CODE.ERR_INVALID_TOKEN:
                    alert(message);
                    window.location.href="/login";
                    break;
                case API_RES_CODE.ERR_TOKEN_EXPIRE:
                    message = "자동로그인 유효기간이 만료되었습니다\n다시 로그인 해주세요";
                    alert(message);
                    window.location.href="/login";
                    break;
                default:
                    alert(msg);
                    window.location.href="/login";
            }
        } else {
            alert(msg);
            window.location.href="/login";
        }

        //this.showAlert(message, ok, cancel, onOk, onCancel);
    },

    
    
    randNum(len = 6) {
        return Math.random().toString(36).substr(2, 2 + len);
    },

    getFormatDate(date, flag) {
        var year = date.getFullYear();              //yyyy
		var month = (1 + date.getMonth());          //M
		month = month >= 10 ? month : '0' + month;  //month 두자리로 저장
		var day = date.getDate();                   //d
		day = day >= 10 ? day : '0' + day;          //day 두자리로 저장
		return  flag === "1" ? (year + '.' + month + '.' + day) : (year + '' + month + '' + day);    
	},

    to_date(date_str)
    {
        var yyyyMMdd = String(date_str);
        var sYear = yyyyMMdd.substring(0,4);
        var sMonth = yyyyMMdd.substring(4,6);
        var sDate = yyyyMMdd.substring(6,8);

        return new Date(Number(sYear), Number(sMonth)-1, Number(sDate));
    },

    getLimitedByteText(inputText, maxByte) {
        const characters = inputText.split('')
        let validText = ''
        let totalByte = 0
      
        for (let i = 0; i < characters.length; i += 1) {
          const character = characters[i]
          const decimal = character.charCodeAt(0)
          const byte = this.getByteLength(decimal) // 글자 한 개가 몇 바이트 길이인지 구해주기
      
          // 현재까지의 바이트 길이와 더해 최대 바이트 길이를 넘지 않으면 
          if (totalByte + byte <= maxByte) { 
            totalByte += byte      // 바이트 길이 값을 더해 현재까지의 총 바이트 길이 값을 구함
            validText += character // 글자를 더해 현재까지의 총 문자열 값을 구함
          } else {                 // 최대 바이트 길이를 넘으면
            break                  // for 루프 종료
          }
        }
      
        return validText
      },
      getTextByte(inputText) {
        const characters = inputText.split('')
        let validText = ''
        let totalByte = 0
      
        for (let i = 0; i < characters.length; i += 1) {
          const character = characters[i]
          const decimal = character.charCodeAt(0)
          const byte = this.getByteLength(decimal) // 글자 한 개가 몇 바이트 길이인지 구해주기
      
          // 현재까지의 바이트 길이와 더해 최대 바이트 길이를 넘지 않으면 
          //if (totalByte + byte <= maxByte) { 
            totalByte += byte      // 바이트 길이 값을 더해 현재까지의 총 바이트 길이 값을 구함
            validText += character // 글자를 더해 현재까지의 총 문자열 값을 구함
          //} 
        //else {                 // 최대 바이트 길이를 넘으면
        //     break                  // for 루프 종료
        //   }
        }
      
        return totalByte
      },

      getByteLength(decimal) {
        const LINE_FEED = 10; 
        return (decimal >> 7) || (LINE_FEED === decimal) ? 2 : 1
      }

};