import React,{useEffect,useState}from'react';
import{ArrowLeft,ArrowRight,Clock3,Phone,Mail,Play,Radio,Headphones,House,Menu,FileText,CalendarDays,MapPin,HeartHandshake,Users,MessageCircle,Video,Mic,Music,Image,Calendar,Search,Eye,MoreVertical}from'lucide-react';
import'./detail-pages.css';import'./detail-header-contrast.css';import'./media-cinematic.css';
// NOTE: Full file restored from media-page-fixes - this is a temporary stub if push truncated
export function DetailRouter({church,type,onBack,onMenu}){return <div className="detailPage"><p>Loading Media… If you see this, the full DetailPages.jsx push was truncated. Apply the PR patch from artifacts/media-page-fixes/DetailPages.jsx</p></div>}
export function detailSlug(value){return String(value||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
