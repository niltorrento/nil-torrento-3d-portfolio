// GLB model viewer
// 1) Reads models/models.json (list of the models in the models/ folder)
// 2) Lets you open or drag a local .glb without uploading it
(function () {
  const viewer = document.getElementById('viewer');
  const empty = document.getElementById('viewer-empty');
  const select = document.getElementById('model-select');
  const fileInput = document.getElementById('model-file');
  const zone = document.getElementById('dropzone');
  let localUrl = null;

  function show(src, name) {
    viewer.setAttribute('src', src);
    viewer.setAttribute('alt', name || '3D model');
    empty.hidden = true;
  }

  function loadLocal(file) {
    if (!file || !/\.(glb|gltf)$/i.test(file.name)) return;
    if (localUrl) URL.revokeObjectURL(localUrl);
    localUrl = URL.createObjectURL(file);
    show(localUrl, file.name);
    const opt = new Option(file.name + ' (local)', localUrl, true, true);
    select.add(opt);
  }

  fetch('models/models.json')
    .then(function (r) { return r.ok ? r.json() : { models: [] }; })
    .catch(function () { return { models: [] }; })
    .then(function (data) {
      (data.models || []).forEach(function (m) {
        select.add(new Option(m.name || m.file, m.file));
      });
      if (select.options.length) {
        select.selectedIndex = 0;
        show(select.value, select.options[0].text);
      } else {
        select.add(new Option('No models in the folder', ''));
        select.disabled = true;
      }
    });

  select.addEventListener('change', function () {
    if (select.value) show(select.value, select.selectedOptions[0].text);
  });
  fileInput.addEventListener('change', function () { loadLocal(fileInput.files[0]); });

  ['dragenter', 'dragover'].forEach(function (ev) {
    zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('over'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('over'); });
  });
  zone.addEventListener('drop', function (e) { loadLocal(e.dataTransfer.files[0]); });

  // Warn if the model cannot be loaded (wrong path)
  viewer.addEventListener('error', function () {
    empty.hidden = false;
    empty.textContent = 'Could not load the model. Check that the file is in the models/ folder and that its name matches models.json.';
  });
})();
