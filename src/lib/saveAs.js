// from http://stackoverflow.com/questions/283956/
const saveAs = (uri, filename) => {
  const link = document.createElement('a');
  if (typeof link.download === 'string') {
    document.body.appendChild(link); // Firefox requires the link to be in the body
    link.download = filename;
    link.href = uri;
    link.click();
    document.body.removeChild(link); // remove the link when done
  } else {
    location.replace(uri);
  }
};

export default saveAs;
