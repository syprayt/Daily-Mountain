const scene = document.querySelector(".scene");
let day;
let dayCount;

let oldText;
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
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${data.accessToken}`,
      };
      response = await fetch(url, options);
    } else {
      throw new Error("User is not logged in");
    }
  }
  return response;
}
async function write(day, text) {
  try {
    const response = await authFetch("http://localhost:3000/note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.accessToken}`,
      },
      body: JSON.stringify({
        day: day - 1,
        text: text,
      }),
    });
  } catch (error) {
    window.location.replace("Mountain_menu_main.html");
  }
}
async function Days() {
  try {
    const response = await authFetch("http://localhost:3000/days", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`,
      },
    });
    day = await response.json();
    dayCount = [
      Math.ceil(day.length / 2),
      Math.floor(day.length / 2),
      day.length - 1,
    ];
  } catch (error) {
    window.location.replace("Mountain_menu_main.html");
  }
}

await Days();
let template_1 = document.querySelector(".foot_stone_1");
let template_2 = document.querySelector(".foot_stone_2");
let stones = [template_1, template_2];
let template_textbox = document.querySelector(".text-box");
let multiplication = [157, 314];
for (let j = 0; j < stones.length; j++) {
  if (dayCount[j] != 0) {
    for (let i = 0; i < dayCount[j]; i++) {
      const copy = stones[j].cloneNode(true);
      copy.id = i * 2 + j + 1;
      copy.style.cursor = "pointer";
      copy.style.bottom = i * 314 + multiplication[j] + "px";
      const name = copy.querySelector(".Date");
      const d = new Date(day[copy.id - 1].date);
      const dayss = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const europeanDate = `${dayss}.${month}.${year}`;
      name.textContent = europeanDate;
      const copy_textbox = copy.querySelector(".text-box");
      copy_textbox.style.bottom = parseInt(copy.style.bottom) - 21 + "px";
      const text = copy_textbox.querySelector(".stone_text");
      const edit = copy_textbox.querySelector(".Edit");
      const yes = copy_textbox.querySelector(".Yes");
      const no = copy_textbox.querySelector(".No");
      if (j == 0) copy_textbox.style.left = 285 - 138 + "px";
      else {
        copy_textbox.style.left = 400 + 52 + "px";
        copy_textbox.style.transform = "scaleX(-1)";
        text.style.transform = "scaleX(-1)";
        edit.style.transform = "scaleX(-1)";
        yes.style.transform = "scaleX(-1)";
        text.style.textAlign = "right";
      }
      copy.addEventListener("click", () => {
        const text = copy_textbox.querySelector(".stone_text");
        text.scrollTop = 0;
        if (copy_textbox.style.opacity == 1) {
          copy_textbox.style.opacity = 0;
        } else {
          copy_textbox.style.opacity = 1;
        }
      });
      edit.addEventListener("click", () => {
        yes.style.opacity = 1;
        no.style.opacity = 1;
        yes.style.pointerEvents = "auto";
        no.style.pointerEvents = "auto";
        edit.style.opacity = 0;
        edit.style.pointerEvents = "none";
        oldText = text.textContent;
        text.contentEditable = "true";
        text.style.background = "white";
      });
      yes.addEventListener("click", () => {
        yes.style.opacity = 0;
        no.style.opacity = 0;
        yes.style.pointerEvents = "none";
        no.style.pointerEvents = "none";
        edit.style.opacity = 1;
        edit.style.pointerEvents = "auto";
        text.contentEditable = "false";
        text.style.background = "none";
        write(parseInt(copy.id), text.textContent);
      });
      no.addEventListener("click", () => {
        yes.style.opacity = 0;
        no.style.opacity = 0;
        yes.style.pointerEvents = "none";
        no.style.pointerEvents = "none";
        edit.style.opacity = 1;
        edit.style.pointerEvents = "auto";
        text.textContent = oldText;
        text.contentEditable = "false";
        text.style.background = "none";
      });
      scene.appendChild(copy);
      scene.appendChild(copy_textbox);
    }
  }
}
template_1 = document.querySelector(".hand_stone_1");
template_2 = document.querySelector(".hand_stone_2");
stones = [template_1, template_2];
multiplication = [500, 544];
const different = [-48, 44];
for (let j = 0; j < stones.length; j++) {
  for (let i = 1; i - 1 < dayCount[2]; i++) {
    const copy = stones[j].cloneNode(true);
    if (i % 2 == !0 && j == 1)
      copy.style.bottom = i * 157 + multiplication[j] + different[0] + "px";
    else if (i % 2 == !0 && j == 0)
      copy.style.bottom = i * 157 + multiplication[j] + different[1] + "px";
    else copy.style.bottom = i * 157 + multiplication[j] + "px";
    scene.appendChild(copy);
  }
}
const objects = document.querySelectorAll(".scene > div");
let maxBottom = 0;

objects.forEach((obj) => {
  const bottom = parseInt(obj.style.bottom) || 0;
  const height = obj.offsetHeight;
  const topPosition = bottom + height;
  if (topPosition > maxBottom) maxBottom = topPosition;
});

scene.style.height = maxBottom + 100 + "px";

let character = document.querySelector(".character");
const character_sprite = [
  "/Character_left/",
  "/Character_right/",
  "/Character_front_left/",
  "/Character_front_right/",
];
//const character_sprite = ["/Images/Character_mirror.png", "/Images/Character.png", "/Images/Character_forward.png"];
const character_objects = [
  //left, right, front_left, front_right
  [0, 0, 47, 45], //hair top 0
  [115, 128, 127, 108], //hair left 1
  [102, 102, 111, 111], //hair width 2
  [122, 122, 131, 131], //hair height 3
  [1, 1, 0, 0], // eye opacity [0 - hide, 1 - show] 4
  [
    [0, 117],
    [1, 117],
    [0, 0],
    [0, 0],
  ], //eye direction [0 - left, 1 - right] 5
  [124, 123, 168, 168], //shirt top 6
  [
    [0, 77],
    [1, 80],
    [0, 102],
    [1, 102],
  ], //shirt left and right 7
  [125.5, 125.5, 135.03, 135.03], //shirt height 8
  [35, 35, 29, 29], //pants bottom 9
  [
    [0, 97],
    [1, 100],
    [0, 105],
    [1, 105],
  ], //pants left and right 10
  [177, 177, 123, 123], //pants width 11
  [299.5, 299.5, 250.5, 250.05], //pants height 12
  [5, 5, 20, 20], //skin top 13
  [
    [0, 0],
    [1, 0],
    [0, 18],
    [1, 18],
  ], //skin left and right 14
  [343.02, 348.02, 335.5, 335.5], //skin width 15
  [192.55, 190.05, 220, 220], //skin height 16
  [
    [0, 89],
    [1, 91],
    [0, 100],
    [1, 100],
  ], //shoes left and right 17
  [206.5, 206.5, 134.5, 134.5], //shoes width 18
  [188, 188, 52, 52], //shoes height 19
  [1, 1, 0, 0], //not change opacity 20
  [
    [0, 112],
    [1, 115],
    [0, 0],
    [0, 0],
  ], //not change direction 21
];
const character_parts = [
  character.querySelector(".hair"),
  character.querySelector(".eye"),
  character.querySelector(".shirt"),
  character.querySelector(".pants"),
  character.querySelector(".skin"),
  character.querySelector(".shoes"),
  character.querySelector(".not_change"),
];
const character_parts_names = [
  "hair",
  "eye",
  "shirt",
  "pants",
  "skin",
  "shoes",
  "not_change",
];
const title = document.querySelector(".title");
let pose = 1;
function setStyle(element, prop, value) {
  if (value !== undefined && prop != "opacity")
    element.style[prop] = value + "px";
  else if (value !== undefined && prop == "opacity")
    element.style[prop] = value;
}
function switchSide(element, direction) {
  if (direction[0] == 0) {
    element.style.right = "auto";
    element.style.left = direction[1] + "px";
  } else if (direction[0] == 1) {
    element.style.left = "auto";
    element.style.right = direction[1] + "px";
  }
}
function changeCharacter(direction) {
  for (let i = 0; i < character_parts.length; i++) {
    character_parts[i].style.backgroundImage =
      `url('${"/Images" + character_sprite[direction] + character_parts_names[i] + ".png"}')`;
  }
  setStyle(character_parts[0], "top", character_objects[0][direction]);
  setStyle(character_parts[0], "left", character_objects[1][direction]);
  setStyle(character_parts[0], "width", character_objects[2][direction]);
  setStyle(character_parts[0], "height", character_objects[3][direction]);

  setStyle(character_parts[1], "opacity", character_objects[4][direction]);
  switchSide(character_parts[1], character_objects[5][direction]);

  setStyle(character_parts[2], "top", character_objects[6][direction]);
  switchSide(character_parts[2], character_objects[7][direction]);
  setStyle(character_parts[2], "height", character_objects[8][direction]);

  setStyle(character_parts[3], "bottom", character_objects[9][direction]);
  switchSide(character_parts[3], character_objects[10][direction]);
  setStyle(character_parts[3], "width", character_objects[11][direction]);
  setStyle(character_parts[3], "height", character_objects[12][direction]);

  setStyle(character_parts[4], "top", character_objects[13][direction]);
  switchSide(character_parts[4], character_objects[14][direction]);
  setStyle(character_parts[4], "width", character_objects[15][direction]);
  setStyle(character_parts[4], "height", character_objects[16][direction]);

  switchSide(character_parts[5], character_objects[17][direction]);
  setStyle(character_parts[5], "width", character_objects[18][direction]);
  setStyle(character_parts[5], "height", character_objects[19][direction]);

  setStyle(character_parts[6], "opacity", character_objects[20][direction]);
  switchSide(character_parts[6], character_objects[21][direction]);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Escape") {
    let pos = parseInt(getComputedStyle(character).bottom);
    character.style.bottom = pos + 157 + "px";
    changeCharacter(2);
    if (pose == 1) {
      changeCharacter(2);
      setTimeout(() => {
        changeCharacter(0);
      }, 200);
      pose = 0;
    } else {
      changeCharacter(3);
      setTimeout(() => {
        changeCharacter(1);
      }, 200);
      pose = 1;
    }
  }
});
const back = document.querySelector(".back");
back.addEventListener("click", () => {
  window.location.href = "Mountain_menu_main.html";
});
let pos = parseInt(getComputedStyle(character).bottom);
character.style.bottom = pos + dayCount[2] * 157 + "px";
if (dayCount[2] % 2 == 0) {
  changeCharacter(1);
}
