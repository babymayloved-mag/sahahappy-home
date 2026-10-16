const shell=document.querySelector('[data-youtube-url]');
if(shell){
  const raw=shell.dataset.youtubeUrl.trim();
  let id='';
  if(raw){
    try{
      const url=new URL(raw);
      if(url.hostname.includes('youtu.be'))id=url.pathname.split('/').filter(Boolean)[0]||'';
      else if(url.hostname.includes('youtube.com'))id=url.searchParams.get('v')||url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1]||'';
    }catch{}
  }
  if(/^[\w-]{11}$/.test(id)){
    const poster=document.createElement('button');
    poster.type='button';
    poster.className='video-poster';
    poster.setAttribute('aria-label','เล่นวิดีโอ กว่าจะเป็นเตียง SahahappyHome');
    const thumbnail=document.createElement('img');
    thumbnail.src='catalog/images/1450.webp';
    thumbnail.alt='ภาพเตียงสปา SAHA HAPPY HOME';
    thumbnail.loading='lazy';
    const play=document.createElement('span');
    play.className='video-play';
    play.setAttribute('aria-hidden','true');
    play.textContent='▶';
    poster.append(thumbnail,play);
    poster.addEventListener('click',()=>{
      const iframe=document.createElement('iframe');
      iframe.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
      iframe.title='กว่าจะเป็นเตียง SahahappyHome';
      iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen=true;
      shell.replaceChildren(iframe);
    });
    shell.replaceChildren(poster);
  }
}
