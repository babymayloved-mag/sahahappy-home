export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Frame original source pixels; never regenerate product shapes, colors or materials.
export function photoMarkup(data, src, alt, frameRatio = 4 / 3, lazy = true) {
  const m = data.media[src];
  if (!m) throw new Error(`Missing photo metadata: ${src}`);
  const [x,y,w,h] = m.crop;
  const ratio = m.width * w / (m.height * h);
  return `<span class="photo-frame" style="--frame-ratio:${frameRatio}"><span class="photo-crop" style="width:${Math.min(100,100*ratio/frameRatio)}%;height:${Math.min(100,100*frameRatio/ratio)}%;${m.mask?`clip-path:${escapeHTML(m.mask)};`:''}"><img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" width="${m.width}" height="${m.height}" ${lazy?'loading="lazy"':'fetchpriority="high"'} decoding="async" style="width:${100/w}%;height:${100/h}%;left:${-100*x/w}%;top:${-100*y/h}%"></span></span>`;
}
