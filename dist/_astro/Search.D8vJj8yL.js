import{j as t}from"./jsx-runtime.D_zvdyIk.js";import{r as o}from"./index.Cd_vQiNd.js";const E=()=>{const[a,x]=o.useState(""),[n,h]=o.useState([]),[p,i]=o.useState(!1),[b,k]=o.useState([]),[m,u]=o.useState(0),f=o.useRef(null),w=o.useRef(null);o.useEffect(()=>{fetch("/search-index.json").then(e=>e.json()).then(e=>k(e)).catch(e=>console.error("Error loading search index:",e))},[]),o.useEffect(()=>{const e=r=>{f.current&&!f.current.contains(r.target)&&i(!1)};return document.addEventListener("mousedown",e),()=>document.removeEventListener("mousedown",e)},[]);const z=e=>{if(!e.trim()){h([]),i(!1);return}const r=e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),g=b.filter(s=>{const c=s.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),l=s.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),d=s.alias?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")||"";return c.includes(r)||l.includes(r)||d.includes(r)}).sort((s,c)=>{const l=s.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),d=c.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),y=l.includes(r),N=d.includes(r);return y&&!N?-1:!y&&N?1:0});h(g.slice(0,8)),i(!0),u(0)};o.useEffect(()=>{const e=setTimeout(()=>{z(a)},200);return()=>clearTimeout(e)},[a,b]);const D=e=>{if(!(!p||n.length===0))switch(e.key){case"ArrowDown":e.preventDefault(),u(r=>(r+1)%n.length);break;case"ArrowUp":e.preventDefault(),u(r=>(r-1+n.length)%n.length);break;case"Enter":e.preventDefault(),n[m]&&(window.location.href=n[m].url);break;case"Escape":i(!1),w.current?.blur();break}},v=(e,r)=>{if(!r.trim())return e;const j=e.normalize("NFD").replace(/[\u0300-\u036f]/g,""),g=r.normalize("NFD").replace(/[\u0300-\u036f]/g,""),s=j.toLowerCase().indexOf(g.toLowerCase());if(s===-1)return e;const c=e.slice(0,s),l=e.slice(s,s+r.length),d=e.slice(s+r.length);return t.jsxs(t.Fragment,{children:[c,t.jsx("mark",{className:"search-highlight",children:l}),d]})};return t.jsxs("div",{className:"search-container",ref:f,children:[t.jsxs("div",{className:"search-input-wrapper",children:[t.jsxs("svg",{className:"search-icon",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",children:[t.jsx("circle",{cx:"11",cy:"11",r:"8",strokeWidth:"2"}),t.jsx("path",{d:"m21 21-4.35-4.35",strokeWidth:"2",strokeLinecap:"round"})]}),t.jsx("input",{ref:w,type:"text",className:"search-input",placeholder:"Buscar...",value:a,onChange:e=>x(e.target.value),onKeyDown:D,onFocus:()=>a&&i(!0)}),a&&t.jsx("button",{className:"search-clear",onClick:()=>{x(""),h([]),i(!1)},"aria-label":"Limpiar búsqueda",children:"×"})]}),p&&n.length>0&&t.jsx("div",{className:"search-results",children:n.map((e,r)=>t.jsxs("a",{href:e.url,className:`search-result-item ${r===m?"selected":""}`,onMouseEnter:()=>u(r),children:[t.jsxs("div",{className:"result-header",children:[t.jsx("span",{className:"result-title",children:v(e.title,a)}),t.jsx("span",{className:"result-category",children:e.category})]}),t.jsxs("p",{className:"result-description",children:[v(e.description.slice(0,100),a),e.description.length>100?"...":""]})]},`${e.type}-${e.url}`))}),p&&a&&n.length===0&&t.jsx("div",{className:"search-results",children:t.jsxs("div",{className:"search-no-results",children:['No se encontraron resultados para "',a,'"']})}),t.jsx("style",{children:`
        .search-container {
          position: relative;
          width: 100%;
          max-width: 400px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #666;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 2.75rem;
          font-size: 0.95rem;
          font-family: var(--font-body);
          border: 2px solid var(--color-border);
          border-radius: 8px;
          background: white;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(220, 0, 0, 0.1);
        }

        .search-clear {
          position: absolute;
          right: 12px;
          width: 24px;
          height: 24px;
          border: none;
          background: var(--color-accent);
          color: white;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }

        .search-clear:hover {
          background: var(--color-primary);
        }

        .search-results {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: white;
          border: 2px solid var(--color-border);
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
        }

        .search-result-item {
          display: block;
          padding: 1rem;
          border-bottom: 1px solid var(--color-border);
          text-decoration: none;
          color: inherit;
          transition: background 0.15s ease;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item:hover,
        .search-result-item.selected {
          background: var(--color-background-alt);
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .result-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-secondary);
        }

        .result-category {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-accent);
          white-space: nowrap;
        }

        .result-description {
          font-size: 0.875rem;
          color: var(--color-text-light);
          line-height: 1.4;
          margin: 0;
        }

        .search-highlight {
          background: rgba(220, 0, 0, 0.2);
          color: var(--color-primary);
          font-weight: 600;
          padding: 0 2px;
          border-radius: 2px;
        }

        .search-no-results {
          padding: 2rem;
          text-align: center;
          color: var(--color-text-light);
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .search-container {
            max-width: 100%;
          }

          .search-results {
            max-height: 300px;
          }

          .result-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `})]})};export{E as default};
