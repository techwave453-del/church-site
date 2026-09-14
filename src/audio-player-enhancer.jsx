import React from"react";
import{createRoot}from"react-dom/client";
import AudioPlayer from"./components/AudioPlayer.jsx";

const AUDIO_EXT=/\.(mp3|m4a|wav|ogg|webm)(?:[?#].*)?$/i;
const isAudioHref=href=>{try{const url=new URL(href,window.location.href);return AUDIO_EXT.test(url.pathname)||/^(audio\/)/i.test(url.protocol.replace(":",""))}catch{return AUDIO_EXT.test(href||"")}};

function enhance(root=document){root.querySelectorAll(".mediaAction[href]").forEach(link=>{if(link.dataset.audioEnhanced==="1"||!isAudioHref(link.href))return;link.dataset.audioEnhanced="1";const host=document.createElement("div");host.className="audioPlayerMount";link.replaceWith(host);const view=host.closest(".sermonView");const title=view?.querySelector("h1,h2,h3")?.textContent?.trim()||"Sermon audio";const speaker=view?.querySelector(".mediaMeta,.sermonMeta")?.textContent?.trim()||"";createRoot(host).render(<AudioPlayer src={link.href} title={title} speaker={speaker}/>)});}

let observer;
export function startAudioPlayerEnhancer(){enhance();if(observer)return;observer=new MutationObserver(mutations=>mutations.forEach(m=>m.addedNodes.forEach(node=>{if(node.nodeType===1){enhance(node)}})));observer.observe(document.body,{childList:true,subtree:true});}

if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",startAudioPlayerEnhancer,{once:true});else startAudioPlayerEnhancer();}
