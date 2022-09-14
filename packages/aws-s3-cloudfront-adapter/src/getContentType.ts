export const getContentType = (extension: string) => {
  if (extension === 'html') return 'text/html';
  else if (extension === 'js') return 'text/javascript';
  else if (extension === 'json') return 'application/json';
  else if (extension === 'txt') return 'text/plain';
  return 'application/octet-stream';
};
