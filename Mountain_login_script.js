const email = document.getElementById("email");
const password = document.getElementById("pass");
const errorMessage = document.getElementById("Message");
const button = document.getElementById("button");
const Logo = document.getElementById("namee");
Logo.addEventListener("click", () => {
  window.location.replace("Mountain_menu_main.html");
});
function validateInput(input) {
  input.value = input.value.replace(/\s/g, "");
}

function login() {
  errorMessage.textContent = "";
  if (email.value && password.value) {
    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: email.value.trim(),
        password: password.value,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          errorMessage.innerHTML = `<label id='errorlabel'>${data.error || "Login error"}</label>`;
        } else {
          localStorage.setItem("accessToken", data.accessToken);
          //window.location.replace("Mountain_menu_main.html");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        errorMessage.innerHTML =
          "<label id='errorlabel'>Server unavailable</label>";
      });
  } else {
    errorMessage.innerHTML =
      "<label id='errorlabel'>All fields are required</label>";
  }
}
