const username = document.getElementById("regUser");
const email = document.getElementById("regEm");
const password = document.getElementById("regPass");
const passwordConfirm = document.getElementById("regPassConfirm");
const errorMessage = document.getElementById("registerMessage");
const button = document.getElementById("registerButton");

function validateInput(input) {
    input.value = input.value.replace(/\s/g, '');
}

function register() {
    errorMessage.textContent = ""; 
    if (password.value !== passwordConfirm.value) {
        errorMessage.innerHTML = "<label id='errorlabel'>Passwords don't match!</label>";
    } 
    else if (username.value && email.value && password.value) {
        fetch('http://localhost:3000/registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username.value.trim(),
                email: email.value.trim(),
                password: password.value
            })
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                errorMessage.innerHTML = `<label id='errorlabel'>${data.error || "Registration error"}</label>`;
            } else {
                console.log("Registration success, redirecting");
                window.location.replace("Mountain_login_main.html");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.innerHTML = "<label id='errorlabel'>Server unavailable</label>";
        });
    }
    else {
        errorMessage.innerHTML = "<label id='errorlabel'>All fields are required</label>";
    }
}