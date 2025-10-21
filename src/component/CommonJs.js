import GlobalStore from "../store/GlobalStore";
import { API_RES_CODE } from '../component/AppConstants';
import { Base64 } from 'js-base64';

//index.html파일에서 style.css 수정 됐음 ver=현재날짜로 변경 

const location = window.location.origin;
export let isRealServer = false;
if(location.includes("//noma") === true){        // 운영 서버
    isRealServer = true;
}

export const apiUrl =  isRealServer ? "https://noma.t-ime.com/" : "http://211.219.7.51:8080/";  //"https://devnoma.t-ime.com/";   // //"http://211.219.7.51:8080/"; //"http://localhost:60006/";  //            -- 개발 : "https://dodapnote.t-ime.com/"
export const apiUrl1 = isRealServer ? "https://ariapp.t-ime.com/" : "https://devariapp.t-ime.com/";  //"http://localhost:60006/"; //
export const apiUrl2 = isRealServer ? "https://otapp.t-ime.com/" : "http://devotapp.t-ime.com/";
//export const aiApiUrl = isRealServer ? "http://218.239.223.143:8889/" : "http://218.239.223.143:8889/";//"http://147.46.219.245:35013/"; //surromind AI서버
//export const mswitchImgUrl = isRealServer ? "https://mswitch.mswitch.co.kr/ari" :  "http://mswitchdev.t-ime.com/ari";
//export const editorUrl = isRealServer ? "https://adm.mswitch.co.kr" : "http://admmswitchdev.t-ime.com";

//export const pdfPassword = "timebook!@#45";          // 비번이 걸려 있는 pdf렌더링 할때 자동으로 파일 오픈

export function fetchApiCall(site, api, bodyData)  {
	//let bodyData = {class_id:class_id};
	if(site === "S") {
		bodyData.login_token = GlobalStore.login_token !== null ? GlobalStore.login_token : bodyData.login_token;
	}
	if(site === "MSLMS") {
    // 유지 필요 시 외부에서 전달된 토큰을 그대로 사용. 재할당 제거
	}

	let url = "";
	if(site === "MS") url = apiUrl1;
	else if(site === "OT") url = apiUrl2;
	else if(site === "MSARI") url = apiUrl1;        // window.sessionStorage.setItem이 바로 안되는 현상으로 추가..
	else {
		url = apiUrl;
	}

	return fetch(url+api, {
		method: "POST",
		headers: {
			"Content-Type":"application/json",
			"Accept": "application/hal+json",
			"$version": "0.0.1",
			"$client_type": "android",
			"$language": "ko",
			"$secure_token": (site === "MSARI") ? Base64.decode(window.sessionStorage.getItem("mpdf@secure_token")) : GlobalStore.secure_token
		},
		body: JSON.stringify(bodyData),
	})
	.then(response=>response.json())
	.then(responseJson=>{
		//console.log(responseJson);
		return responseJson;
	})
	.catch(error=>{
		//alert('통신실패 :'+error);
		let responseJson = {"result_message": "","result_code": API_RES_CODE.ERR_NETWORK,}
		return responseJson;
		//console.log(error);
	});
}

export function fetchUploadApiCall(api, formData)  {
	return fetch(apiUrl+api, {
		method: "POST",
		//headers: {"Content-Type":"multipart/form-data;charset=UTF-8"},
		body: formData,
	})
	.then(response=>response.json())
	.then(responseJson=>{
		//console.log(responseJson);
		return responseJson;
	})
	.catch(error=>{
		alert('통신실패 :'+error);
		//console.log(error);
	});
}

export function loginGetIp(){
	let bodyData = {};
	fetchApiCall("S","xyzCientIp", bodyData)
	.then(responseJson => {
		if(responseJson.result_code === "0000") {
			window.sessionStorage.setItem("noma@clientIp", responseJson.clientIP);
		}
	});	
}

export function numberFormat(inputNumber) {
	return inputNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


export function replaceAll(str, searchStr, replaceStr){
    return str.split(searchStr).join(replaceStr);
}

// 값을 null, undefined 체크
export function returnNullCheck(str){
	let ret_str = str;
	if(str === null || str === undefined || str === "undefined"){
		ret_str = "";
	}
	return ret_str;
}

// kruddo add - 문장 split에서 사용할 구분자

// kruddo - 난수 생성
export function randomNumber(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isMobile() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function getInputTextLength(inputTxt) { 
	var len = 0;
	for (var i = 0; i < inputTxt.length; i++) {
		if (escape(inputTxt.charAt(i)).length === 6) {
			len++;
		}
		len++;
	}
	return len;
}
