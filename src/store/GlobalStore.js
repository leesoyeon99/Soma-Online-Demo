import { observable } from 'mobx';
import { Base64 } from 'js-base64';

export default observable({
	mem_seq:window.sessionStorage.getItem("noma@mem_seq") === null ? null : Base64.decode(window.sessionStorage.getItem("noma@mem_seq")),
	center_seq:window.sessionStorage.getItem("noma@center_seq") === null ? null : Base64.decode(window.sessionStorage.getItem("noma@center_seq")),
	group_code:window.sessionStorage.getItem("noma@group_code") === null ? null : Base64.decode(window.sessionStorage.getItem("noma@group_code")),
	login_id:window.sessionStorage.getItem("noma@login_id") === null ? null : Base64.decode(window.sessionStorage.getItem("noma@login_id")),
	mem_name:window.sessionStorage.getItem("noma@mem_name") === null ? null : Base64.decode(window.sessionStorage.getItem("noma@mem_name")),
	secure_token:window.sessionStorage.getItem("noma@secure_token") === null ? null : Base64.decode(window.sessionStorage.getItem("noma@secure_token")),
	login_token:window.sessionStorage.getItem("noma@login_token") === null ? null : Base64.decode(window.sessionStorage.getItem("noma@login_token")),
});