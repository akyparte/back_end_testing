let submit_btn = document.getElementById('submit');
let OTP_field = document.getElementById('OTP');
let username = document.getElementById('username');

let forgot_headline = document.getElementById('forgot_pass_headline');
let forgot_info_line = document.getElementById('forgot_pass_info_line');

let set_headline = document.getElementById('set_pass_headline');
let set_info_line = document.getElementById('set_pass_info_line');
let password = document.getElementById('pass');
let confirm_password = document.getElementById('confirmpass');

async function submitOTP(e) {
  e.preventDefault();
    if(username.value.length > 0 && OTP_field.value.length > 0){
        let userData = {username:username.value.trim(),OTP:OTP_field.value.trim()}
        let result = await fetch('/forgot_password/validateOTP',{
            method:'post',
            headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(userData),
        })
        result = await result.json();
        console.log(result);
        if(result.response === 'ACCESSALLOWED'){
          console.log(result);
             forgot_headline.style.display = 'none';
             forgot_info_line.style.display = 'none';

             OTP_field.style.display = 'none';

             set_headline.style.display = 'block';
             set_info_line.style.display = 'block';

             password.style.display = 'block';
             confirm_password.style.display = 'block';
             submit_btn.value = 'Change';
             submit_btn.removeEventListener('click',submitOTP);
             submit_btn.addEventListener('click',setNewPassword);
             
        }else if(result.response === 'ACCESSDENIED'){
          username.reportValidity();
          username.setCustomValidity("Invalid Username");
          OTP_field.reportValidity();
          OTP_field.setCustomValidity("Invalid OTP");
        }

    }else {

    }
}

async function sendEmail(e) {
  e.preventDefault();
  if (username.value.trim().length === 0) {
    username.reportValidity();
    username.setCustomValidity("username is missing");
  }else {
    let userData = {
      username: username.value.trim(),
    };
    let result = await fetch("/forgot_password/send_email", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    result = await result.json();
    if (result.response === "OTPSENT") {    
      submit_btn.value = "Submit OTP";
      OTP_field.style.display = 'block';
      submit_btn.removeEventListener('click',sendEmail);
      submit_btn.addEventListener('click',submitOTP);
    } else if (result.response === "OTPNOTSENT") {
      username.reportValidity();
      username.setCustomValidity("Username is Not Registered");
    } else if (result.response === "SERVERERROR") {
      username.reportValidity();
      username.setCustomValidity("server error");
    }
  }
}


async function setNewPassword(e) {
  e.preventDefault();
    if(username.value.trim().length > 0 && password.value.trim().length > 0 && confirm_password.value.length > 0){
        if(password.value.trim() === confirm_password.value.trim()){
            let userData = {
              username:username.value.trim(),
              password:password.value.trim()
            }

            let result = await fetch('/forgot_password/save_new_pass',{
               method: "post",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(userData),
            });
            result = await result.json();
            if(result.response === 'PASSWORDISCHANGED'){
                location.href = '/';

            }else if(result.response === 'PASSWORDNOTCHANGED'){
              username.reportValidity();
              username.setCustomValidity("Invalid Username");
            }
        }
    }else if(!username.value.trim().length){
      username.reportValidity();
      username.setCustomValidity("missing Username");   
    }else if(!password.value.trim().length){
      password.reportValidity();
      password.setCustomValidity("missing password"); 
    }else if(confirm_password.value.length){
      confirm_password.reportValidity();
      confirm_password.setCustomValidity("missing confirm_password"); 
    }
}

submit_btn.addEventListener('click',sendEmail);