class Api {
  static instance = null;
  static getInstance(host, authToken) {
    if (Api.instance === null) {
      console.log('Creating instance');
      Api.instance = new Api(host, authToken);
    }
    return Api.instance;
  }

  static getToken(host, username, password) {
    return fetch(`https://${host}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        return data.token;
      });
  }

  constructor(host, authToken) {
    this.host = host;
    this.__authToken__ = authToken;

    console.log(host);
  }

  getDocuments() {
    return fetch(`https://${this.host}/api/documents/`, {
      method: 'GET',
      headers: { Authorization: `Token ${this.__authToken__}` },
    }).then((response) => response.json());
  }
}

export default Api;
