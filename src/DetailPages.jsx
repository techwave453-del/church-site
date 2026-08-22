import React from 'react';
import { ArrowLeft, ArrowRight, Clock3, Phone, Mail } from 'lucide-react';
import './detail-pages.css';

const details = {
  'sunday-worship-service': { eyebrow:'Worship Service', title:'Sunday Worship Service', summary:'Gather with the Kingdom Fellowship Christian Church family for worship, the Word of God, prayer and fellowship.', schedule:'Every Sunday · 9:00 AM', sections:[['What to Expect','A welcoming worship experience with congregational praise, biblical teaching, prayer and opportunities to connect with other believers.'],['Who Can Attend?','Everyone is welcome—families, young people, first-time visitors and members of the church family.'],['Come Prepared','Bring your Bible, an expectant heart and a friend. Arrive a little early so you have time to settle in and connect.']] },
  'healing-and-deliverance-service': { eyebrow:'Prayer & Ministry', title:'Healing and Deliverance Service', summary:'A focused time of prayer, biblical ministry and seeking God for healing, freedom and restoration.', schedule:'Every Tuesday · 5:30 PM', sections:[['A Time of Prayer','Come ready to pray and receive ministry in an atmosphere centred on faith in Jesus Christ.'],['Biblical Encouragement','The service combines Scripture, prayer and practical encouragement for people trusting God through difficult seasons.'],['Bring Someone Along','Invite a friend or family member who would appreciate a supportive, prayerful church community.']] },
  'power-communion-service': { eyebrow:'Communion & Fellowship', title:'Power Communion Service', summary:'A midweek gathering centred on communion, worship, the Word and fellowship.', schedule:'Every Wednesday · 5:30 PM', sections:[['Remember Christ','Share in communion as a church family and reflect on the work of Jesus Christ.'],['Grow in the Word','Receive biblical teaching and encouragement designed to strengthen your walk of faith.'],['Connect','Midweek services are a practical opportunity to stay connected and encouraged between Sundays.']] },
  'worship-word-wonders-night': { eyebrow:'Friday Gathering', title:'Worship, Word & Wonders Night', summary:'An evening of worship, teaching and prayer as the church seeks God together.', schedule:'Every Friday · 5:30 PM', sections:[['Worship','Lift your heart in congregational worship and create space to focus on God.'],['The Word','Hear practical, Scripture-based teaching for everyday Christian living.'],['Wonders','Join the church in prayer and expectation for God to work in the lives of His people.']] },
  'commanding-the-day-midnight-prayer': { eyebrow:'Prayer Watch', title:'Commanding the Day Midnight Prayer', summary:'A dedicated prayer gathering for believers who want to begin a new season, day or month in prayer.', schedule:'Last Friday of the month · 11:00 PM', sections:[['A Night of Prayer','Set aside the night to pray, reflect and seek God together with the church family.'],['Spiritual Preparation','Use the gathering to commit plans, families, ministries and personal goals to God.'],['Stay Connected','Check the church announcements for any changes to the monthly prayer schedule.']] },
  'im-new-here': { eyebrow:'First Visit', title:"I'm New Here", summary:'We would love to welcome you to Kingdom Fellowship Christian Church. You do not need to know anyone or have everything figured out before you come.', sections:[['Before You Arrive','Choose a service that works for you, plan to arrive a few minutes early and come as you are.'],['When You Arrive','Look for the welcome team. They can help with directions, seating and any questions you may have.'],['After the Service','Take a moment to meet someone, ask questions or contact the church if you would like help getting connected.']] },
  'find-a-branch': { eyebrow:'Church Community', title:'Find a Branch', summary:'Connect with a Kingdom Fellowship Christian Church community near you.', sections:[['Local Fellowship','Branches provide opportunities for worship, discipleship, prayer and fellowship within the wider church family.'],['Need Directions?','Contact the church office for the current branch location, service schedule and directions.'],['Want to Start a Connection?','Use the contact details below and let the team know which area you are in.']] },
  'upcoming-programs': { eyebrow:'Church Calendar', title:'Upcoming Programs', summary:'Stay informed about worship services, prayer meetings, discipleship classes, special services and church activities.', sections:[['Weekly Gatherings','Our regular services provide consistent opportunities for worship, teaching, prayer and fellowship.'],['Special Events','Special programs may be added throughout the year. Watch the announcements for dates, venues and registration requirements.'],['Stay Updated','Follow the church website and official announcements for the latest programme information.']] },
  'testimonies': { eyebrow:'Stories of Faith', title:'Testimonies', summary:'Celebrate stories of faith, answered prayer, growth and what God is doing in the lives of the church family.', sections:[['Share Your Story','If you have a testimony you would like the church to celebrate, contact the church team.'],['Encourage Others','Testimonies can remind others that they are not alone and encourage them to keep trusting God.'],['Give Glory to God','Every story is an opportunity to celebrate God’s goodness while respecting the privacy of those involved.']] },
  'resources': { eyebrow:'Grow in Faith', title:'Resources', summary:'Find helpful materials for discipleship, Bible study, prayer and continued spiritual growth.', sections:[['Messages & Teaching','Use available sermons and media to revisit biblical teaching and continue learning during the week.'],['Study & Discipleship','Membership and foundation classes provide structured opportunities to grow in understanding and Christian maturity.'],['Need Help Finding Something?','Contact the church team if you are looking for a specific sermon, class or resource.']] },
  'foundation-class': { eyebrow:'Discipleship', title:'Foundation Class', summary:'A starting point for learning the foundations of Christian faith, church life and discipleship.', sections:[['Purpose','Build a strong foundation in the Gospel, Scripture, prayer, fellowship and practical Christian living.'],['Who Is It For?','New believers, new members and anyone who wants to strengthen their understanding of the foundations of faith.'],['Registration','Use the registration/contact option to ask about the next available class.']] },
  'maturity-class': { eyebrow:'Discipleship', title:'Maturity Class', summary:'A structured opportunity for believers who want to deepen their understanding and maturity in Christ.', sections:[['Grow Deeper','Explore Christian character, spiritual disciplines, service and practical application of Scripture.'],['Serve With Purpose','Learn how spiritual growth connects with serving God, the church and the wider community.'],['Registration','Contact the church for the next class dates and registration details.']] },
  'visit-us': { eyebrow:'Plan Your Visit', title:'Visit Us', summary:'We would be delighted to worship and fellowship with you.', sections:[['Service Times','See the current service schedule on the Events section of the website.'],['Location','For the latest branch location and directions, contact the church office before travelling.'],['What to Expect','Expect a welcoming Christian community, worship, biblical teaching, prayer and fellowship.']] },
  'give': { eyebrow:'Generosity', title:'Support the Ministry', summary:'Thank you for supporting the work of the church. Giving helps the ministry serve people, strengthen discipleship and continue its mission.', sections:[['Give Responsibly','Use only official giving details provided by the church. If you are unsure, contact the church office before sending funds.'],['A Heart of Generosity','Christian giving is an expression of gratitude, worship and a desire to support the work of ministry.'],['Need the Details?','Contact the church for the current official giving channels and instructions.']] },
  'contact': { eyebrow:'Connect With Us', title:'Contact the Church', summary:'Have a question, need directions, want to join a ministry or need more information? Reach out to the church team.', sections:[['Phone','Call the church using the official number shown on the website.'],['Email','Send an email for enquiries that do not require an immediate response.'],['Message','You can also use the website chat/contact control to start a conversation.']] },
  'media': { eyebrow:'Watch & Listen', title:'Media', summary:'Explore church media, worship content, teaching and other materials made available through the website.', sections:[['Sermons','Revisit teaching and encouragement from church gatherings.'],['Live Worship','When a live stream is enabled, use the Live button to join the service online.'],['Gallery','Browse approved church images and media shared through the website.']] }
};

const slugify=value=>String(value||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

function normalizeDetail(value, fallback) {
  if (!value || typeof value !== 'object') return fallback;
  const sections = Array.isArray(value.sections)
    ? value.sections.map((section, index) => {
        if (Array.isArray(section)) return [String(section[0] || `Section ${index + 1}`), String(section[1] || '')];
        if (section && typeof section === 'object') return [String(section.heading || section.title || `Section ${index + 1}`), String(section.text || section.description || '')];
        return null;
      }).filter(Boolean)
    : fallback.sections;
  return {
    ...fallback,
    ...value,
    eyebrow: value.eyebrow || fallback.eyebrow,
    title: value.title || fallback.title,
    summary: value.summary || fallback.summary,
    schedule: value.schedule || fallback.schedule,
    sections: sections.length ? sections : fallback.sections
  };
}

function getDetail(church, key) {
  const fallback = details[key] || details[slugify(key)] || {
    eyebrow:'Kingdom Fellowship',
    title:key,
    summary:'More information will be added by the church team.',
    sections:[['More Information','Please contact the church for the latest details about this programme or ministry.']]
  };
  const saved = church?.detailContent || {};
  const candidates = [key, slugify(key), fallback.title, slugify(fallback.title)].filter(Boolean);
  const custom = candidates.map(candidate => saved[candidate]).find(value => value && typeof value === 'object');
  return normalizeDetail(custom, fallback);
}

function DetailPage({church,type,onBack}) {
  const key=type||'visit-us';
  const item=getDetail(church,key);
  return <div className="detailPage"><header className="detailHeader"><button className="detailBack" onClick={onBack}><ArrowLeft size={18}/> Back to website</button><div className="detailBrand"><strong>{church?.name||'Kingdom Fellowship Christian Church'}</strong><span>{church?.tagline||'Revealing Christ to Nations'}</span></div></header><main><section className="detailHero"><span>{item.eyebrow}</span><h1>{item.title}</h1><p>{item.summary}</p>{item.schedule&&<div className="detailSchedule"><Clock3 size={18}/>{item.schedule}</div>}</section><section className="detailGrid">{item.sections.map(([heading,text],index)=><article key={`${heading}-${index}`}><div className="detailIcon"><ArrowRight size={18}/></div><h2>{heading}</h2><p>{text}</p></article>)}</section><section className="detailCta"><div><span>Kingdom Fellowship Christian Church</span><h2>Have questions or want to get connected?</h2><p>Our church team will be happy to help you with directions, registration, programmes or any other enquiry.</p></div><div className="detailActions"><a href={`tel:${church?.phone||''}`}><Phone size={17}/> Call</a><a href={`mailto:${church?.email||''}`}><Mail size={17}/> Email</a><button onClick={onBack}><ArrowLeft size={17}/> Return to site</button></div></section></main><footer className="detailFooter"><strong>{church?.name||'Kingdom Fellowship Christian Church'}</strong><span>{church?.footerTagline||'Revealing Christ to Nations'}</span></footer></div>
}

export function DetailRouter({church,type,onBack}){return <DetailPage church={church} type={type} onBack={onBack}/>}
export function detailSlug(value){return slugify(value)}
