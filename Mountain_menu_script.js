const mountain = document.querySelector(".Mountain");
const email = document.querySelector(".Email");
const arrow = document.querySelector(".Arrow");
const logout = document.querySelector(".Logout");
mountain.addEventListener("click", () => {
  window.location.href = "Mountain_main.html";
});
async function authFetch(url, options = {}) {
  let response = await fetch(url, options);

  if (response.status == 403) {
    const refreshResponse = await fetch("http://localhost:3000/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      localStorage.setItem("accessToken", data.accessToken);
      options.headers.Authorization = `Bearer ${data.accessToken}`;
      response = await fetch(url, options);
    } else {
      throw new Error("User is not logged in");
    }
  }
  return response;
}
async function profile() {
  try {
    const response = await authFetch("http://localhost:3000/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`,
      },
    });
    const data = await response.json();
    email.textContent = data.email;
    email.style.textDecoration = "none";
    arrow.style.opacity = 1;
  } catch (error) {
    console.log(error);
    email.textContent = "Sign up/Log in";
    arrow.style.opacity = 0;
  }
}
profile();
email.addEventListener("click", () => {
  if (arrow.style.opacity == 0) {
    window.location.replace("Mountain_login_main.html");
  }
});
arrow.addEventListener("click", () => {
  if (logout.style.opacity == 0) logout.style.opacity = 1;
  else logout.style.opacity = 0;
});
logout.addEventListener("click", () => {
  fetch("http://localhost:3000/logout", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.accessToken}`,
    },
    credentials: "include",
  }).then(async (response) => {
    logout.style.opacity = 0;
    email.textContent = "Sign up/Log in";
    arrow.style.opacity = 0;
    localStorage.removeItem("accessToken");
  });
});
