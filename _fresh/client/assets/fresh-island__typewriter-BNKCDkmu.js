import{d as r,y as P}from"./hooks.module-CrgpAwqi.js";import{u as f}from"./jsxRuntime.module-BTwEtFpS.js";function A({text:e,speed:k,loop:o,pause:n,unwrite:u}){const[I,a]=r(""),[t,c]=r(0),[l,v]=r(0),[m,g]=r(!1),h=(k??.05)*1e3,[x,D]=Array.isArray(n)?n:[n??1.5,n??1.5],y=x*1e3,T=D*1e3,b=()=>h*(.85+Math.random()*.3);return P(()=>{if(e.length===0)return;const d=e[l],p=()=>{v(i=>(i+1)%e.length),c(0),a("")};let s;return m?t>0?s=globalThis.setTimeout(()=>{a(d.slice(0,t-1)),c(i=>i-1)},b()):s=globalThis.setTimeout(()=>{g(!1),(o||l<e.length-1)&&p()},T):t<d.length?s=globalThis.setTimeout(()=>{a(d.slice(0,t+1)),c(i=>i+1)},b()):s=globalThis.setTimeout(()=>{u?g(!0):(o||l<e.length-1)&&p()},y),()=>globalThis.clearTimeout(s)},[t,l,m,e,h,y,T,o,u]),f("div",{style:{display:"inline-block"},children:[I,f("span",{className:"cursor",children:"|"}),f("style",{jsx:!0,children:`
        .cursor {
          display: inline-block;
          margin-left: 2px;
          animation: blink 1s step-start infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `})]})}export{A as default};
