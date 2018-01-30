// Gluipertje.js by Eli Saado and contributors, licensed under the MIT license (https://github.com/elisaado/Gluipertje.js/blob/master/LICENSE).
// Made to interact with the Gluipertje API (https://github.com/elisaado/gluipertje-backend)

// "Class" Gluipertje, should implement all API methods.
function Gluipertje(host, port) {
  let baseurl = `${host}:${port}/api`;

  async function fetchJSON(url) {
    let response = await fetch(url);
    let json = await response.json();
    return json;
  }

  async function postJSON(url, data) {
    let response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({'Content-Type': 'application/json'})
    });
    return await response.json();
  }

  async function parseUser(user) {
    if (user.constructor === Array && user.length > 0) {
      let users = user;
      let parsed = [];
      for (let user of users) {
        parsed.push(await parseUser(user));
      }
      return parsed;
    }
    else if (user.constructor === String && user.length > 0) {
      try {
        return await parseUser(JSON.parse(user));
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

  async function parseMessage(message) {
    if (message.constructor === Array && message.length > 0) {
      let messages = message;
      let parsed = [];
      for (let message of messages) {
        parsed.push(await parseMessage(message));
      }
      return parsed;
    }
    else if (message.constructor === String && message.length > 0) {
      try {
        return await parseMessage(JSON.parse(message));
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
        parsed.from = await getUserById(parsed.from_id);
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

  async function getAllUsers() {
    return await parseUser(await fetchJSON(`${baseurl}/users`));
  }

  async function getUserById(id) {
    return await parseUser(await fetchJSON(`${baseurl}/user/${id}`));
  }

  async function getUserByToken(token) {
    return await parseUser(await fetchJSON(`${baseurl}/${token}/me`));
  }

  async function revokeToken(username, password) {
    return await postJSON(`${baseurl}/token`, {username: username, password: password});
  }

  async function createUser(nickname, username, password) {
    return await parseUser(await postJSON(`${baseurl}/users`, {nickname: nickname, username: username, password: password}));
  }


  async function getAllMessages() {
    return await parseMessage(await fetchJSON(`${baseurl}/messages`));
  }

  async function getMessageById(id) {
    return await parseMessage(await fetchJSON(`${baseurl}/message/${id}`));
  }

  async function getMessagesByLimit(n) {
    return await parseMessage(await fetchJSON(`${baseurl}/messages/${n}`));
  }

  async function getLastMessage() {
    return (await getMessagesByLimit(1))[0];
  }

  async function createMessage(token, body) {
    return await parseMessage(await postJSON(`${baseurl}/messages`, {token: token, body: body}));
  }

  this.message = {};
  this.message.all = getAllMessages;
  this.message.byLimit = getMessagesByLimit;
  this.message.byId = getMessageById;
  this.message.last = getLastMessage;
  this.message.send = createMessage;

  this.user = {};
  this.user.all = getAllUsers;
  this.user.byId = getUserById;
  this.user.byToken = getUserByToken;
  this.user.revokeToken = revokeToken;
  this.user.create = createUser;
  return this;
}

try {
  module.exports = Gluipertje;
} catch (e) {
  console.log("You failed");
}