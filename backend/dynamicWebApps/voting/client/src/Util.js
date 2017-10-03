const Auth = {
  authenticate: token => localStorage.setItem('token', token),
  isAuthenticated: () => localStorage.getItem('token') !== null,
  deAuthenticate: () => localStorage.removeItem('token'),
  getToken: () => localStorage.getItem('token'),
};

const nFetch = (url, verb, includeAuth, dataToSend) => new Promise((resolve, reject) => {
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
  fetch(url, init)
    .then(response => response.json()
      .then((data) => {
        if (response.status === 200) {
          return resolve(data);
        }
        return reject({ status: response.status, error: data });
      }))
    .catch(e => reject({ error: e }));
});

export { Auth, nFetch };
