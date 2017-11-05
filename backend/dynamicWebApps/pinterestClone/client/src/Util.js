const Auth = {
  authenticate: (token, username) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
    } catch (e) {
      localStorage.clear(); // full?
      localStorage.setItem('token', token); // if this fails, throw the error
      localStorage.setItem('username', username);
    }
  },
  isAuthenticated: () => localStorage.getItem('token') !== null,
  deAuthenticate: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  },
  getToken: () => localStorage.getItem('token'),
  getUsername: () => localStorage.getItem('username'),
};

const nFetch = (url, verb, includeAuth, dataToSend) => new Promise(async (resolve, reject) => {
  const init = {
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  };
  if (verb) {
    init.method = verb;
  }
  if (includeAuth) {
    init.headers.append('Authorization', `bearer ${Auth.getToken()}`);
  }
  if (dataToSend) {
    init.body = JSON.stringify(dataToSend);
  }
  try {
    const response = await fetch(url, init);
    const data = await response.json();
    if (response.status === 200) {
      return resolve(data);
    }
    const error = new Error(data);
    error.status = response.status;
    return reject(error);
  } catch (error) {
    return reject(error);
  }
});

export { Auth, nFetch };
