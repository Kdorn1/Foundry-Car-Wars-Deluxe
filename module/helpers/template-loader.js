export async function loadTemplates(paths) {
  if (typeof globalThis.loadTemplate !== "function") {
    throw new Error("loadTemplate is not available in this context.");
  }
  return Promise.all(paths.map(path => globalThis.loadTemplate(path)));
}
