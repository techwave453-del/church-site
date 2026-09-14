import React,{useEffect,useRef,useState}from'react';
import{Download,Headphones,Pause,Play,Volume2,VolumeX}from'lucide-react';

const formatTime=value=>{if(!Number.isFinite(value)||value<0)return'0:00';const total=Math.floor(value);const hours=Math.floor(total/3600);const minutes=Math.floor((total%3600)/60);const seconds=total%60;return hours?`${hours}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`:`${minutes}:${String(seconds).padStart(2,'0')}`};

export default function AudioPlayer({src,title='Audio message',cover,speaker,download=true}){
 const audioRef=useRef(null);const[playing,setPlaying]=useState(false);const[current,setCurrent]=useState(0);const[duration,setDuration]=useState(0);const[volume,setVolume]=useState(1);const[speed,setSpeed]=useState(1);
 useEffect(()=>{const audio=audioRef.current;if(!audio)return;const onTime=()=>setCurrent(audio.currentTime||0);const onMeta=()=>setDuration(audio.duration||0);const onEnd=()=>setPlaying(false);audio.addEventListener('timeupdate',onTime);audio.addEventListener('loadedmetadata',onMeta);audio.addEventListener('ended',onEnd);return()=>{audio.removeEventListener('timeupdate',onTime);audio.removeEventListener('loadedmetadata',onMeta);audio.removeEventListener('ended',onEnd)}},[src]);
 useEffect(()=>{if(audioRef.current){audioRef.current.volume=volume;audioRef.current.playbackRate=speed}},[volume,speed]);
 const toggle=async()=>{const audio=audioRef.current;if(!audio)return;if(audio.paused){try{await audio.play();setPlaying(true)}catch{setPlaying(false)}}else{audio.pause();setPlaying(false)}};
 const seek=e=>{const audio=audioRef.current;if(!audio||!duration)return;const next=Number(e.target.value);audio.currentTime=next;setCurrent(next)};
 const toggleMute=()=>setVolume(v=>v>0?0:1);
 if(!src)return null;
 return <div className="audioPlayer" aria-label={`Audio player for ${title}`}>
  <audio ref={audioRef} src={src} preload="metadata"/>
  <div className="audioPlayerTop">
   <div className="audioPlayerArtwork">{cover?<img src={cover} alt=""/>:<Headphones size={26}/>}</div>
   <div className="audioPlayerIdentity"><span>Audio message</span><strong>{title}</strong>{speaker&&<small>{speaker}</small>}</div>
   <button className="audioPlayerPlay" type="button" onClick={toggle} aria-label={playing?'Pause':'Play'}>{playing?<Pause size={20} fill="currentColor"/>:<Play size={20} fill="currentColor"/>}</button>
  </div>
  <div className="audioPlayerProgress"><span>{formatTime(current)}</span><input type="range" min="0" max={duration||0} step="0.1" value={Math.min(current,duration||0)} onChange={seek} aria-label="Audio progress"/><span>{formatTime(duration)}</span></div>
  <div className="audioPlayerControls">
   <button type="button" onClick={toggleMute} aria-label={volume?'Mute':'Unmute'}>{volume?<Volume2 size={17}/>:<VolumeX size={17}/>}</button>
   <input className="audioPlayerVolume" type="range" min="0" max="1" step="0.05" value={volume} onChange={e=>setVolume(Number(e.target.value))} aria-label="Volume"/>
   <label className="audioPlayerSpeed">Speed <select value={speed} onChange={e=>setSpeed(Number(e.target.value))} aria-label="Playback speed"><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label>
   {download&&<a className="audioPlayerDownload" href={src} download target="_blank" rel="noreferrer"><Download size={16}/> Download</a>}
  </div>
 </div>;
}
