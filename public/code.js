let username_in = document.getElementById('sign-in-username');
let password_in = document.getElementById('sign-in-password');

let username = document.getElementById("sign-up-username");
let email = document.getElementById("sign-up-email");
let password = document.getElementById("sign-up-password");
let confirm_password = document.getElementById("sign-up-confirm-password");

let container = document.getElementById('container');
let sign_in_toggle = document.getElementById('toggle-1');
let sign_up_toggle = document.getElementById('toggle-2');
function toggle() {
	container.classList.toggle('sign-in');
	container.classList.toggle('sign-up');
	if(username_in.value.length) {
		username_in.value = '';
		username_in.style.border = '';
	}	
	if(password_in.value.length) {
		password_in.value = '';
		password_in.placeholder = 'password';
		password_in.style.border = '';
	}

	console.log(getComputedStyle(username).border);
	if(username.value.length||getComputedStyle(username).border === '1px solid rgb(255, 0, 0)'){
         username.value = '';
		 username.style.border = 'none';
	}
	if(password.value.length||getComputedStyle(password).border === '1px solid rgb(255, 0, 0)'){
        password.value = '';
		password.style.border = 'none';
	}
	if(email.value.length||getComputedStyle(email).border === '1px solid rgb(255, 0, 0)'){
        email.value = '';
		email.style.border = 'none';
	}
	if(confirm_password.value.length||getComputedStyle(confirm_password).border === '1px solid rgb(255, 0, 0)'){
		confirm_password.value = '';
		confirm_password.style.border = 'none';
	}
};


sign_in_toggle.addEventListener('click',toggle);
sign_up_toggle.addEventListener('click',toggle);

setTimeout(() => {
	container.classList.add('sign-in')
}, 200);

export {toggle};