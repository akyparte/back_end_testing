let container = document.getElementById('container');
let sign_in_toggle = document.getElementById('toggle-1');
let sign_up_toggle = document.getElementById('toggle-2');
function toggle() {
	container.classList.toggle('sign-in')
	container.classList.toggle('sign-up')
};

sign_in_toggle.addEventListener('click',toggle);
sign_up_toggle.addEventListener('click',toggle);

setTimeout(() => {
	container.classList.add('sign-in')
}, 200);

export {toggle};
