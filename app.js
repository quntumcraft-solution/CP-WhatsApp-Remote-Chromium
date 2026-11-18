const fileInput = document.getElementById('fileInput');
const emptyState = document.getElementById('emptyState');
const report = document.getElementById('report');
const downloadBtn = document.getElementById('downloadBtn');
const downloadUrl = document.getElementById('downloadUrl');

function sizeLabel(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function showReport(file, type, check, compatibility) {
  emptyState.classList.add('hidden');
  report.classList.remove('hidden');
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileType').textContent = type;
  document.getElementById('fileSize').textContent = sizeLabel(file.size);
  document.getElementById('fileCheck').textContent = check;
  document.getElementById('compatibility').textContent = compatibility;
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  const name = file.name.toLowerCase();
  let type = 'Unknown file';
  let check = 'Not verified';
  let compatibility = 'Not established';

  if (name.endsWith('.jar')) {
    type = 'Java Archive (JAR)';
    const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
    check = head.length >= 2 && head[0] === 0x50 && head[1] === 0x4b
      ? 'ZIP/JAR signature found'
      : 'JAR signature not found';
    compatibility = 'IT9020 Java support not confirmed';
  } else if (name.endsWith('.jad')) {
    type = 'Java Application Descriptor (JAD)';
    const text = await file.slice(0, 8192).text();
    check = /MIDlet-Name\s*:/i.test(text) ? 'MIDlet descriptor fields found' : 'Descriptor not confirmed';
    compatibility = 'Requires a compatible Java runtime';
  } else if (name.endsWith('.pac')) {
    type = 'Spreadtrum/Unisoc firmware package';
    check = 'Firmware file selected; app package नाही';
    compatibility = 'Not an installable application';
  } else if (name.endsWith('.zip')) {
    type = 'ZIP archive';
    const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
    check = head[0] === 0x50 && head[1] === 0x4b ? 'ZIP signature found' : 'ZIP signature not found';
    compatibility = 'Archive contents need inspection';
  } else {
    type = file.type || 'Unrecognized file';
    check = 'Extension-based identification only';
    compatibility = 'Not established';
  }

  showReport(file, type, check, compatibility);
});

downloadBtn.addEventListener('click', () => {
  const value = downloadUrl.value.trim();
  if (!value) {
    alert('Please enter a download URL.');
    return;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Invalid protocol');
    window.open(url.href, '_blank');
  } catch (e) {
    alert('Please enter a valid HTTP or HTTPS URL.');
  }
});
