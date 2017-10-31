// convert google books volume format to my simplified book format
const volume2Book = ({ id, volumeInfo }) => ({
  id,
  title: volumeInfo.title,
  authors: volumeInfo.authors,
  cover: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : undefined,
});

// get data for a specific volume
const VolumeInfo = async (id) => {
  if (id === 'token') throw new Error('Bro, dont be trying that!');
  const cachedBook = localStorage.getItem(id);
  if (cachedBook) {
    return JSON.parse(cachedBook);
  }
  const url = `https://www.googleapis.com/books/v1/volumes/${id}`
    + '?fields=id,volumeInfo(title,authors,imageLinks/thumbnail)';
  const response = await fetch(url);
  const json = await response.json();
  if (!json) return Promise.reject();
  const book = volume2Book(json);
  try {
    localStorage.setItem(id, JSON.stringify(book));
  } catch (e) { /* probably full. oh well */ }
  return book;
};

// search for volumes related to a query
const Search = async (query) => {
  const searchUrl = `${'https://www.googleapis.com/books/v1/volumes?'
    + 'fields=items(id,volumeInfo(title,authors,imageLinks/thumbnail))&q='}${
    encodeURIComponent(query)}`;
  const response = await fetch(searchUrl);
  const json = await response.json();
  if (!json || !json.items || !json.items.length) return Promise.reject();
  const books = json.items.map(volume2Book);
  return books;
};

export { VolumeInfo, Search };
