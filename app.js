'use strict';
const key = "2d4dfb9fd6414902b663c25a6c767cfa";
const sdkVersion = '3.5';
const params = "&play=1";
const menuParams = "&play=1&qs=1";
const initSpace = "YJx1weuenGk";
const galleryDistance = 15; // meters
const spaces = {
    "Elementary School": "YJx1weuenGk", 
    "Middle School": "MZuYopSBizg", 
    "Lunch Area And Playground": "TvkHYt3AYKe", 
    "Preschool": "ZMS7QHBGaDH"
};
let arrow, title, menu, iframe, modal, gallery_container, gallery;

document.addEventListener('DOMContentLoaded', ()=>{
    arrow = document.getElementById('space-menu-toggle');
    title = document.getElementById('menu-title');
    menu = document.getElementById('space-menu');
    gallery_container = document.getElementById('mattertag-gallery-container');
    iframe = document.getElementById('showcase');
    iframe.setAttribute('src', `https://my.matterport.com/show/?m=${initSpace}${params}`);
    iframe.addEventListener('load', showcaseLoader, true);

    setupSpaceMenu();
    gallery = document.getElementById('mattertag-gallery');
    const arrow_hide = document.getElementById('mattertag-gallery-toggle');
    setupArrowGallery(arrow_hide);
});

function showcaseLoader(){
    try{
        window.MP_SDK.connect(iframe, key, sdkVersion)
        .then(loadedShowcaseHandler)
        .catch(e => {
            const menu = document.getElementById('menu-container');
            menu.style.display = 'flex';
            console.error(e);
        });
    }catch(e){
        console.error("Could not connect to SDK: ", e);
    }
}

async function loadedShowcaseHandler(sdk){
    console.debug('SDK Connected');
    const menu_container = document.getElementById('menu-container');
    const observers = setupObservers();
    const tags = await setupTags();
    setupGallery(tags);

    // functions
    
    function setupObservers(){
        const observers = {}

        sdk.App.state.subscribe(state => {
            observers.state = state;
        });

        sdk.App.state.waitUntil(state => state.phase === 'appphase.starting')
        .then(() => {
            menu_container.style.display = 'flex';
            gallery_container.style.display = 'flex';
        })
        .catch(console.error);

        sdk.Camera.pose.subscribe(pose => {
            observers.pose = pose;
        });
        
        return observers;
    }

    async function setupTags(){

        const tags = await sdk.Mattertag.getData();
        
        if(iframe.getAttribute('src').includes('emb=1')){
            sdk.on(sdk.Mattertag.Event.LINK_OPEN, (tagSid, url) => {
                menu.classList.add('hidden');
                title.classList.add('hidden');
                closeArrow(arrow);
            });
        }

        return tags;    
    }

    function setupGallery(tags){
        
        populateGallery(getClosestImageTags());
        sdk.on(sdk.Sweep.Event.ENTER, (oldID, newID) => {
            let imageTags = getClosestImageTags();
            populateGallery(imageTags);
        });

        async function populateGallery(imageTags){
            while(gallery.firstChild){
                gallery.removeChild(gallery.firstChild);
            }
            
            imageTags.sort((a, b) => a.distance - b.distance)
            .forEach(addEle);

            function addEle(tag){
                let img = new Image();
                img.onload = () => {
                    const _cont = document.createElement('div');
                    _cont.setAttribute('id', tag.sid);
                    _cont.setAttribute('class', 'mattertag-gallery-item');
                    const imgEle = document.createElement('img');
                    _cont.insertAdjacentElement('beforeend', imgEle);
                    imgEle.setAttribute('src', tag.media.src);
                    _cont.addEventListener('click', () => {
                        sdk.Mattertag.navigateToTag(tag.sid, sdk.Mattertag.Transition.FLY);
                    });
                    gallery.insertAdjacentElement('beforeend', _cont);
                }
                img.src = tag.media.src;
            }

        }
        
        function getClosestImageTags(){
            if(!observers['pose']) return [];
            let photoTags = tags.filter(tag => tag.media.type === 'photo');
            photoTags.forEach(tag => {
                tag.distance = euclideanDistance3D(observers['pose'].position, tag.anchorPosition);
            });
            return photoTags.filter(tag => tag.distance <= galleryDistance);
        }
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

            toggleArrow(arrow.children[0]);         
        });
    }

}

function setupArrowGallery(arr){
            
    arr.addEventListener('click', toggleHidden);

    function toggleHidden(){
        toggleArrow(arr.children[0]);
        gallery.style.height = gallery.style.height === "0px" ? "130px" : "0px";
        arr.style.top = arr.style.top === "0px" ? "130px" : "0px";
    }
}

// utility functions
function euclideanDistance3D(pos1, pos2){
    return Math.sqrt( 
        Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2) +
        Math.pow(pos1.z - pos2.z, 2)
        );
}

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

function closeArrow(arrowEle){
    if(arrowEle.style.transform === 'rotate(135deg)'){
        arrowEle.style.transform = `rotate(315deg)`;
    }else if(arrowEle.style.transform === 'rotate(225deg)'){
        arrowEle.style.transform = `rotate(45deg)`;
    }
}