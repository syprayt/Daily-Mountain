const scene = document.querySelector(".scene");

fetch("http://localhost:3000/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "test" })
});

let template_1 = document.querySelector(".foot_stone_1");
let template_2 = document.querySelector(".foot_stone_2");
let stones = [template_1, template_2];
let template_textbox = document.querySelector(".text-box");
let multiplication = [0, 157];
for (let j = 0; j < stones.length; j++) {
    for (let i = 0; i < 2; i++) {
        const copy = stones[j].cloneNode(true);
        copy.id = i * 2 + j + 1;
        copy.style.bottom = (i * 314 + multiplication[j]) + "px";
        const copy_textbox = copy.querySelector(".text-box");
        copy_textbox.style.bottom = parseInt(copy.style.bottom) - 22 + "px";
        const text = copy_textbox.querySelector(".stone_text");
        if(j == 0) copy_textbox.style.left = 285 - 138 + "px";
        else{
            copy_textbox.style.left = 400 + 52 + "px";
            copy_textbox.style.transform = "rotate(180deg)";
            text.style.transform = "rotate(180deg)";
            text.style.textAlign = "right";
        } 
        text.textContent = "This is day number " + (i * 2 + j + 1);
        copy.addEventListener('click', () => {
            const text = copy_textbox.querySelector(".stone_text");
            text.scrollTop = 0;
            if(copy_textbox.style.opacity == 1) {
                copy_textbox.style.opacity = 0;
            } else {
                copy_textbox.style.opacity = 1;
                text.textContent = copy.id;
            }
            //text.textContent = "This is foot stone number " + (i + 1 + j * 2);
        });
        scene.appendChild(copy);
        scene.appendChild(copy_textbox);
    }
}
template_1 = document.querySelector(".hand_stone_1");
template_2 = document.querySelector(".hand_stone_2");
stones = [template_1, template_2];
multiplication = [544, 500];
const different = [48, -44];
for (let j = 0; j < stones.length; j++) {
    for (let i = 1; i < 2; i++) {
        const copy = stones[j].cloneNode(true);
        if(i % 2 ==! 0 && j == 1) copy.style.bottom = (i * 157 + multiplication[j] + different[0]) + "px";
        else if(i % 2 ==! 0 && j == 0) copy.style.bottom = (i * 157 + multiplication[j] + different[1]) + "px";
        else copy.style.bottom = (i * 157 + multiplication[j]) + "px";
        scene.appendChild(copy);
    }
}
const objects = document.querySelectorAll(".scene > div");
let maxBottom = 0;

objects.forEach(obj => {
  const bottom = parseInt(obj.style.bottom) || 0;   
  const height = obj.offsetHeight;            
  const topPosition = bottom + height;      
  if (topPosition > maxBottom) maxBottom = topPosition;
});

scene.style.height = (maxBottom + 100) + "px";

let character = document.querySelector(".character");
const character_sprite = ["/Character_left/", "/Character_right/", "/Character_front_left/", "/Character_front_right/"]; 
//const character_sprite = ["/Images/Character_mirror.png", "/Images/Character.png", "/Images/Character_forward.png"];
const character_objects = [ //left, right, front_left, front_right
    [0, 0, 47, 45], //hair top 0
    [115, 128, 127, 108], //hair left 1
    [102, 102, 111, 111], //hair width 2
    [122, 122, 131, 131], //hair height 3
    [1, 1, 0, 0], // eye opacity [0 - hide, 1 - show] 4
    [[0, 117], [1, 117], [0,0], [0, 0]],  //eye direction [0 - left, 1 - right] 5
    [124, 123, 168, 168], //shirt top 6
    [[0, 77], [1, 80], [0, 102], [1, 102]], //shirt left and right 7
    [125.5, 125.5, 135.03, 135.03], //shirt height 8
    [35, 35, 29, 29], //pants bottom 9
    [[0, 97], [1, 100], [0, 105], [1, 105]], //pants left and right 10
    [177, 177, 123, 123], //pants width 11
    [299.5, 299.5, 250.5, 250.05], //pants height 12
    [5, 5, 20, 20], //skin top 13
    [[0, 0], [1, 0], [0, 18], [1, 18]], //skin left and right 14
    [343.02, 348.02, 335.5, 335.5], //skin width 15
    [192.55, 190.05, 220, 220], //skin height 16
    [[0, 89], [1, 91], [0, 100], [1, 100]], //shoes left and right 17
    [206.5, 206.5, 134.5, 134.5], //shoes width 18
    [188, 188, 52, 52], //shoes height 19
    [1, 1, 0, 0], //not change opacity 20
    [[0, 112], [1, 115], [0, 0], [0,0]] //not change direction 21
];
const character_parts = [character.querySelector(".hair"), character.querySelector(".eye"), character.querySelector(".shirt"), character.querySelector(".pants"), character.querySelector(".skin"), character.querySelector(".shoes"), character.querySelector(".not_change")];
const character_parts_names = ["hair", "eye", "shirt", "pants", "skin", "shoes", "not_change"];
const title = document.querySelector(".title");
let pose = 0;
function setStyle(element, prop, value) {
    if (value !== undefined && prop != "opacity") element.style[prop] = value + "px";
    else if(value !== undefined && prop == "opacity") element.style[prop] = value;
}
function switchSide(element, direction) {
    if (direction[0] == 0) {
        element.style.right = "auto";
        element.style.left = direction[1] + "px";
    } 
    else if (direction[0] == 1) {
        element.style.left = "auto";
        element.style.right = direction[1] + "px";
    }
}
function changeCharacter(direction) {
    for(let i = 0; i < character_parts.length; i++) {
        character_parts[i].style.backgroundImage  = `url('${"/Images" + character_sprite[direction] + character_parts_names[i] + ".png"}')`;
    }
    setStyle(character_parts[0], 'top', character_objects[0][direction]);
    setStyle(character_parts[0], 'left', character_objects[1][direction]);
    setStyle(character_parts[0], 'width', character_objects[2][direction]);
    setStyle(character_parts[0], 'height', character_objects[3][direction]);

    setStyle(character_parts[1], 'opacity', character_objects[4][direction]);
    switchSide(character_parts[1], character_objects[5][direction]);

    setStyle(character_parts[2], 'top', character_objects[6][direction]);
    switchSide(character_parts[2], character_objects[7][direction]);
    setStyle(character_parts[2], 'height', character_objects[8][direction]);

    setStyle(character_parts[3], 'bottom', character_objects[9][direction]);
    switchSide(character_parts[3], character_objects[10][direction]);
    setStyle(character_parts[3], 'width', character_objects[11][direction]);
    setStyle(character_parts[3], 'height', character_objects[12][direction]);

    setStyle(character_parts[4], 'top', character_objects[13][direction]);
    switchSide(character_parts[4], character_objects[14][direction]);
    setStyle(character_parts[4], 'width', character_objects[15][direction]);
    setStyle(character_parts[4], 'height', character_objects[16][direction]);

    switchSide(character_parts[5], character_objects[17][direction]);
    setStyle(character_parts[5], 'width', character_objects[18][direction]);
    setStyle(character_parts[5], 'height', character_objects[19][direction]);
    
    setStyle(character_parts[6], 'opacity', character_objects[20][direction]);
    switchSide(character_parts[6], character_objects[21][direction]);
    
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
        let pos = parseInt(getComputedStyle(character).bottom);
        character.style.bottom = pos + 157 + "px";
        changeCharacter(2);
        if(pose == 1){
            changeCharacter(2);
            setTimeout(() => {
                changeCharacter(0);
            }, 200);
            pose = 0;
        } 
        else {
            changeCharacter(3);
            setTimeout(() => {
                changeCharacter(1);
            }, 200);
            pose = 1;
        }
    }
});
const back = document.querySelector(".back");
back.addEventListener('click', () => {
    window.location.href = "Mountain_menu_main.html";
});