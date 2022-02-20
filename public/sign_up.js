import{toggle} from  '/code.js';
let username = document.getElementById("sign-up-username");
let email = document.getElementById("sign-up-email");
let password = document.getElementById("sign-up-password");
let confirm_password = document.getElementById("sign-up-confirm-password");
let login_btn = document.getElementById("sign-up-btn");
let sign_up_form = document.querySelector(".form.sign-up");

console.log(password.placeholder);
login_btn.addEventListener("click", async (e) => {
    e.preventDefault();
    let user = username.value.trim();
    let em = email.value.trim();
    let pass = password.value.trim();
    let con_pass = confirm_password.value.trim();

    if (user.length && em.length && pass.length && con_pass.length) {
        if (pass !== con_pass) {
            password.value = "";
            password.placeholder = "password not matched";
            password.style.border = "1px solid red";
            confirm_password.value = "";
            confirm_password.placeholder = "password not matched";
            confirm_password.style.border = "1px solid red";
            return;
        } else if(!em.endsWith('gmail.com')){
               email.value = 'Invalid Email';
               email.style.border = '1px solid red';
               return;
        }else {
            let userObj = {
                username: user,
                email: em,
                password: pass,
            };
            let validUserName = await fetch("/signup", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userObj),
            });
            validUserName = await validUserName.json();
            if (validUserName.response === "created") {
                    // now toggle and take him to sign in page
                    // becasue user account has been created
                    toggle();
             
            }else if(validUserName.response === 'alreadyAvailable'){
                // username.value = 'Username already taken';
                // password.value = '';
                password.placeholder = 'password'
                // email.value = '';
                // confirm_password.value = '';
                confirm_password.placeholder = 'confirm password'
                username.setCustomValidity("Username already taken");
                username.reportValidity();
            }
        }
    } else {
        if(username.value.trim() === 'Username already taken') username.value = '';
        for (let i = 0; i < sign_up_form.children.length - 2; i++) {
            if (sign_up_form.children[i].children[1].value.length === 0) {
                sign_up_form.children[i].children[1].style.border = "1px solid red";
            }
        }
    }
});
