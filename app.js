'use strict';
const key = "2d4dfb9fd6414902b663c25a6c767cfa";
const sdkVersion = '3.5';
const params = "&emb=1&play=1";
const menuParams = "&emb=1&play=1&qs=1";
const initSpace = "YJx1weuenGk";
const spaces = {
    "Oakridge Elementary School": "YJx1weuenGk", 
    "Oakridge Middle School": "MZuYopSBizg", 
    "Oakridge Lunch Area And Playground": "TvkHYt3AYKe", 
    "Oakridge Preschool": "ZMS7QHBGaDH"
};

let arrow, title, menu, iframe, modal;

document.addEventListener('DOMContentLoaded', ()=>{
    arrow = document.getElementById('space-menu-toggle');
    title = document.getElementById('menu-title');
    menu = document.getElementById('space-menu');

    iframe = document.getElementById('showcase');
    iframe.setAttribute('src', `https://my.matterport.com/show/?m=${initSpace}${params}`);
    iframe.addEventListener('load', showcaseLoader, true);

    setupSpaceMenu();
});

function showcaseLoader(){
    try{
        window.MP_SDK.connect(iframe, key, sdkVersion)
        .then(loadedShowcaseHandler)
        .catch(e => {
            const menu = document.getElementById('menu-container');
            menu.style.display = 'flex';
            console.error(e)
        });
    }catch(e){
        console.error("Could not connect to SDK: ", e);
    }
}

async function loadedShowcaseHandler(sdk){
    console.debug('SDK Connected');
    const menu_container = document.getElementById('menu-container');

    setupObservers();
    const tags = await setupTags();
    setupGallery(tags);

    // functions
    // TODO: setupGallery
    // TODO: populateGallery

    function setupObservers(){
        sdk.App.state.waitUntil(state => state.phase === 'appphase.starting')
        .then(() => {
            menu_container.style.display = 'flex';
        });
    }

    async function setupTags(){        
        sdk.on(sdk.Mattertag.Event.LINK_OPEN, (tagSid, url) => {
            menu.classList.add('hidden');
            title.classList.add('hidden');
        });
        return await sdk.Mattertag.getData();
    }

    function setupGallery(tags){
        const gallery = document.getElementById('gallery');
    }

    function populateGallery(gallery, urls){

    }
    function euclideanDistance3D(pos1, pos2){
        return Math.sqrt( 
            Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2) +
            Math.pow(pos1.z - pos2.z, 2)
         );
    }
}   

function setupSpaceMenu(){
    setupArrowListener();

    if(spaces.length <= 0 ) return;
    const menu = document.getElementById('space-menu');
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

            let st = getComputedStyle(arrow.children[0]);
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
            arrow.children[0].style.transform = `rotate(${newAngle}deg)`;
        });
    }
}