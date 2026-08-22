/* Website content editor module */
export const textKeys = [
  'churchName','tagline','title','subtitle','cta','phone','email','footerTagline',
  'aboutEyebrow','aboutTitle','aboutText','videoUrl','audioUrl','fallbackImage'
];

export const schemas = {
  services: {
    title: 'Service', empty: { title: '', time: '', image: '' },
    fields: [['title','Service name','text'],['time','Time','text'],['image','Image URL','url']]
  },
  links: {
    title: 'Homepage Link', empty: { title: '', description: '', url: '', image: '' },
    fields: [['title','Card title','text'],['description','Short description','textarea'],['url','Link / page URL','url'],['image','Image URL','url']]
  },
  membershipClasses: {
    title: 'Class', empty: { title: '', description: '', image: '', registrationUrl: '' },
    fields: [['title','Class name','text'],['description','Description','textarea'],['image','Image URL','url'],['registrationUrl','Registration link','url']]
  },
  gallery: {
    title: 'Gallery Image', empty: { title: '', url: '', category: '' },
    fields: [['title','Photo title','text'],['url','Image URL','url'],['category','Category','text']]
  }
};

export function createEmptyData() {
  return { services: [], links: [], membershipClasses: [], gallery: [] };
}

export function renderEditor(document, key, data, escapeHtml) {
  const box = document.getElementById(key === 'membershipClasses' ? 'classesEditor' : `${key}Editor`);
  const cfg = schemas[key];
  if (!box) return;
  const items = data[key] || [];
  box.innerHTML = items.length ? items.map((item, i) => `
    <div class="editor-item">
      <div class="editor-head"><strong>${escapeHtml(item.title || `${cfg.title} ${i + 1}`)}</strong>
      <button class="danger small" type="button" data-remove="${key}" data-index="${i}">Remove</button></div>
      <div class="grid">${cfg.fields.map(([field, label, type]) => `
        <div><label>${escapeHtml(label)}</label>${type === 'textarea'
          ? `<textarea data-field="${escapeHtml(field)}" data-index="${i}" data-key="${key}">${escapeHtml(item[field] || '')}</textarea>`
          : `<input data-field="${escapeHtml(field)}" data-index="${i}" data-key="${key}" type="${type === 'url' ? 'url' : 'text'}" value="${escapeHtml(item[field] || '')}">`}</div>`
      ).join('')}</div>
    </div>`).join('') : `<div class="empty">No ${cfg.title.toLowerCase()}s yet.</div>`;
}

export function addItem(data, key) {
  data[key].push({ ...schemas[key].empty });
}

export function removeItem(data, key, index) {
  data[key].splice(index, 1);
}
