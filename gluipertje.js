// Gluipertje.js by Eli Saado and contributors, licensed under the MIT license (https://github.com/elisaado/Gluipertje.js/blob/master/LICENSE).
// Made to interact with the Gluipertje API (https://github.com/elisaado/gluipertje-backend)

class Gluipertje {
  constructor ({host, port}) {
    this.baseurl = `${host}:${port}/api`;
  }

  static async fetchJSON({url}) {
    let response = await fetch(url);
    let json = await response.json();
    return json;
  }

  static async postJSON({url, data}) {
    let response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({'Content-Type': 'application/json'})
    });
    return await response.json();
  }

  static async parseUser(user) {
    if (user.constructor === Array && user.length > 0) {
      let users = user;
      let parsed = [];
      for (let user of users) {
        parsed.push(await this.constructor.parseUser(user));
      }
      return parsed;
    }
    else if (user.constructor === String && user.length > 0) {
      try {
        return await this.constructor.parseUser(JSON.parse(user));
      }
      catch (e) {
        console.log(e);
        return user;
      }
    }
    else if (user.constructor === Object) {
      try {
        let parsed = user;
        parsed.created_at = new Date(parsed.created_at);
        parsed.updated_at = new Date(parsed.updated_at);
        parsed.deleted_at = new Date(parsed.deleted_at);
        if (parsed.deleted_at == "Invalid Date") {
          delete parsed.deleted_at;
        } 
        return parsed;
      } catch (e) {
        console.log(e);
        return user;
      }
    }
    else {
      return user;
    }
  }

  static async parseMessage(message) {
    if (message.constructor === Array && message.length > 0) {
      let messages = message;
      let parsed = [];
      for (let message of messages) {
        parsed.push(await this.parseMessage(message));
      }
      return parsed;
    }
    else if (message.constructor === String && message.length > 0) {
      try {
        return await this.parseMessage(JSON.parse(message));
      }
      catch (e) {
        console.log(e);
        return message;
      }
    }
    else if (message.constructor === Object) {
      try {
        let parsed = message;
        parsed.created_at = new Date(parsed.created_at);
        parsed.updated_at = new Date(parsed.updated_at);
        parsed.deleted_at = new Date(parsed.deleted_at);
        if (parsed.deleted_at == "Invalid Date") {
          delete parsed.deleted_at;
        }
        delete parsed.from_id;
        return parsed;
      } catch (e) {
        console.log(e);
        return message;
      }
    }
    else {
      return message;
    }
  }

  async getAllUsers() {
    return await this.constructor.parseUser(await this.constructor.fetchJSON({url: `${this.baseurl}/users`}));
  }

  async getUserById(id) {
    return await this.constructor.parseUser(await this.constructor.fetchJSON({url: `${this.baseurl}/user/${id}`}));
  }

  async getUserByUsername(username) {
    return await this.constructor.parseUser(await this.constructor.fetchJSON({url: `${this.baseurl}/user/${username}`}));
  }

  async getUserByToken(token) {
    return await this.constructor.parseUser(await this.constructor.fetchJSON({url: `${this.baseurl}/${token}/me`}));
  }

  async revokeToken({username, password}) {
    return await this.constructor.postJSON({url: `${this.baseurl}/token`, data: {username, password}});
  }

  async createUser({nickname, username, password}) {
    return await this.constructor.parseUser(await this.constructor.postJSON({url: `${this.baseurl}/users`, data: {nickname, username, password}}));
  }


  async getAllMessages() {
    return await this.constructor.parseMessage(await this.constructor.fetchJSON({url: `${this.baseurl}/messages`}));
  }

  async getMessageById(id) {
    return await this.constructor.parseMessage(await this.constructor.fetchJSON({url: `${this.baseurl}/message/${id}`}));
  }

  async getMessagesByLimit(n) {
    return await this.constructor.parseMessage(await this.constructor.fetchJSON({url: `${this.baseurl}/messages/${n}`}));
  }

  async getLastMessage() {
    return (await this.getMessagesByLimit(1))[0];
  }

  async sendMessage({token, text}) {
    return await this.constructor.parseMessage(await this.constructor.postJSON({url: `${this.baseurl}/messages`, data: {token, text}}));
  }
}

try {
  module.exports = Gluipertje;
} catch (e) {
  console.log(e);
}
