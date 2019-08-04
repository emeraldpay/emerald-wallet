// from http://stackoverflow.com/questions/283956/
export function saveAs(uri: string, filename: string) {
  const link = document.createElement('a');
  if (typeof link.download === 'string') {
    document.body.appendChild(link); // Firefox requires the link to be in the body
    link.download = filename;
    link.href = uri;
    link.click();
    document.body.removeChild(link); // remove the link when done
  } else {
    location.replace(uri); // eslint-disable-line
  }
}

export function saveJson(json: string, filename: string) {
  const blob = new Blob([JSON.stringify(json)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  saveAs(url, filename);
}
