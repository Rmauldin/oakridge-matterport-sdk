'use strict';
const key = "fe2587b5509f46949a166ee38ec362b6"; // Ryan's specific dev key
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
let arrow, title, menu, iframe, modal;
// const school_regex = /\((https?:\/\/(?:www\.)?oakridgeschool.org\/?.*?)\)/;

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
            console.error(e);
        });
    }catch(e){
        console.error("Could not connect to SDK: ", e);
    }
}

async function loadedShowcaseHandler(sdk){
    console.debug('SDK Connected');
    const menu_container = document.getElementById('menu-container');
    const gallery = document.getElementById('gallery');
    const observers = setupObservers();
    const tags = await setupTags();
    setupGallery(tags);

    // functions
    // TODO populateGallery
    // TODO getClosestImageTags
    
    function setupObservers(){
        const observers = {}

        sdk.App.state.subscribe(state => {
            observers.state = state;
        });

        sdk.App.state.waitUntil(state => state.phase === 'appphase.starting')
        .then(() => {
            menu_container.style.display = 'flex';
            gallery.style.display = 'flex';
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
                arrow.children[0].style.transform = `rotate(315deg)`;
            });
        }

        return tags;

    
    }

    function setupGallery(tags){
        let imageTags = getClosestImageTags();
        populateGallery(imageTags);
        sdk.on(sdk.Sweep.Event.ENTER, (oldID, newID) => {
            imageTags = getClosestImageTags();
            populateGallery(imageTags);
        });

        function populateGallery(imageTags){
            while(gallery.firstChild){
                gallery.removeChild(gallery.firstChild);
            }
            imageTags.forEach(tag => {
                const cont = document.createElement('div');
                const imgEle = document.createElement('img');
                cont.insertAdjacentElement('beforeend', imgEle);

                imgEle.setAttribute('src', tag.media.src);
                imgEle.setAttribute('alt', "");

                cont.addEventListener('click', () => {
                    sdk.Mattertag.navigateToTag(tag.sid, sdk.Mattertag.Transition.FLY);
                });

                gallery.insertAdjacentElement('beforeend', cont);
            });
        }
    
        function getClosestImageTags(){
            if(!observers['pose']) return [];
            return tags
            .filter(tag => tag.media.type === 'photo')
            .filter(tag => euclideanDistance3D(observers['pose'].position, tag.anchorPosition) <= galleryDistance);
        }

        function euclideanDistance3D(pos1, pos2){
            return Math.sqrt( 
                Math.pow(pos1.x - pos2.x, 2) +
                Math.pow(pos1.y - pos2.y, 2) +
                Math.pow(pos1.z - pos2.z, 2)
             );
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