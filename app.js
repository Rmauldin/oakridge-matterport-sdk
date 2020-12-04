'use strict';
const params = "&play=1";
const menuParams = "&play=1&qs=1";

const spaces = {
    "Elementary School": "YJx1weuenGk", 
    "Middle School": "MZuYopSBizg", 
    "Lunch Area And Playground": "TvkHYt3AYKe", 
    "Preschool": "ZMS7QHBGaDH"
};
const initSpace = spaces["Elementary School"];
let arrow, title, menu, iframe, modal;

document.addEventListener('DOMContentLoaded', ()=>{
    arrow = document.getElementById('space-menu-toggle');
    title = document.getElementById('menu-title');
    menu = document.getElementById('space-menu');
    iframe = document.getElementById('showcase');
    iframe.setAttribute('src', `https://my.matterport.com/show/?m=${initSpace}${params}`);
    iframe.addEventListener('load', e => {
        document.getElementById('menu-container').style.display = "flex";
    });
    setupSpaceMenu();
});

function setupSpaceMenu(){
    const menu = document.getElementById('space-menu');
    setupArrowListener();

    if(spaces.length <= 0 ) return;
    
    let listEle;
    for(const [name, sid] of Object.entries(spaces)){
        listEle = document.createElement('li');
        listEle.innerText = name;
        listEle.setAttribute('class', 'menu-item');
        setClickListener(listEle, sid);
        menu.insertAdjacentElement('beforeend', listEle);
    };

    function setClickListener(ele, sid){
        ele.addEventListener('click', e => {
            iframe.setAttribute('src', `https://my.matterport.com/show/?m=${sid}${menuParams}`);
        });
    }

    function setupArrowListener(){
        arrow.addEventListener('click', () => {
            title.classList.toggle('hidden');
            menu.classList.toggle('hidden');

            toggleArrow(arrow.children[0]);         
        });
    }
}

// utility functions

function toggleArrow(arrowEle){
    let st = getComputedStyle(arrowEle);
    let tr =    st.getPropertyValue("-webkit-transform") ||
                    st.getPropertyValue("-moz-transform") ||
                    st.getPropertyValue("-ms-transform") ||
                    st.getPropertyValue("-o-transform") ||
                    st.getPropertyValue("transform");

    let values = tr.split('(')[1];
    values = values.split(')')[0];
    values = values.split(',');
    
    let a = values[0],
        b = values[1];

    const angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
    const newAngle = angle + 180 % 360;
    arrowEle.style.transform = `rotate(${newAngle}deg)`;
}
