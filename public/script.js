// DONE: Use Axios instead of fetch
// DONE: Write and use your own lite version of jQuery

class jQueryLite {
  constructor(sel) {
    if (typeof sel === 'string' || sel instanceof String) {
      if (sel.startsWith('<') && sel.endsWith('>')) {
        this.elements = [
          document.createElement(sel.substring(1, sel.length - 1)),
        ];
        console.log(sel.substring(1, sel.length - 1));
      } else {
        this.elements = [...document.querySelectorAll(sel)];
      }
    } else if (sel instanceof Array) {
      this.elements = sel;
    } else {
      this.elements = [sel];
    }
  }
  get(index) {
    return this.elements[index];
  }
  set html(htmlString) {
    this.elements.forEach((el) => (el.innerHTML = htmlString));
  }
  get html() {
    if (this.elements.length == 1) return this.elements[0].innerHTML;
    return this.elements.map((el) => el.innerHTML);
  }
  set text(textString) {
    this.elements.forEach((el) => (el.innerText = textString));
  }
  get text() {
    if (this.elements.length == 1) return this.elements[0].innerText;
    return this.elements.map((el) => el.innerText);
  }
  set val(value) {
    this.elements.forEach((el) => (el.value = value));
  }
  get val() {
    if (this.elements.length == 1) return this.elements[0].value;
    return this.elements.map((el) => el.value);
  }
  prop(name, state = null) {
    if (state === null) {
      if (this.elements.length == 1) return this.elements[0][name];
      return this.elements.map((el) => el[name]);
    }
    this.elements.forEach((el) => (el[name] = state));
  }
  css(name, val = null) {
    if (val) {
      this.elements.forEach((el) => (el.style[name] = val));
    } else {
      if (this.elements.length == 1) return this.elements[0].style[name];
      return this.elements.map((el) => el.style[name]);
    }
  }
  toggle(displayStyle = 'block') {
    this.elements.forEach((el) => {
      if (el.style.display === 'none') {
        el.style.display = displayStyle;
      } else {
        el.style.display = 'none';
      }
    });
  }
  show(displayStyle = 'block') {
    this.elements.forEach((el) => (el.style.display = displayStyle));
  }
  hide() {
    this.elements.forEach((el) => (el.style.display = 'none'));
  }
  on(event, callback) {
    this.elements.forEach((el) => el.addEventListener(event, callback));
  }
  removeClass(className) {
    this.elements.forEach((el) => el.classList.remove(className));
  }
  addClass(className) {
    this.elements.forEach((el) => el.classList.add(className));
  }
  valid() {
    return this.elements
      .map((el) => el.checkValidity())
      .every((el) => el === true);
  }
  append(element) {
    this.elements.forEach((el) => el.appendChild(element));
  }
}
let $ = (sel) => new jQueryLite(sel);

const select = $('#course');
const idBox = $('#uvuIdBox');
const idInput = $('#uvuId');

const logDisplay = $('#logContainer');
const logList = $('#uvuLogs');
const logId = $('#uvuIdDisplay');

const newLogTxtArea = $('#newLog');
const newLogBtn = $('#newLogBtn');

const url =
  'https://jsonserver6noo2h-tsgg--3000.local-credentialless.webcontainer.io/api/v1/';

// GET courses dynamically to the course dropdown
axios
  .get(url + 'courses')
  .then((response) => {
    response.data.forEach((course) => {
      const option = $('<option>');
      option.val = course.id;
      option.prop('text', course.display);
      select.append(option.get(0));
    });
  })
  .catch((error) => console.log(error));

// only display uvu id input box when a course is selected
select.on('change', () => {
  if (select.val == '') {
    idBox.hide();
    clearLogs();
  } else {
    displayLogsById(idInput.val);
    idBox.show();
  }
  logReady();
});

// ID input box validation check and display logs
function displayLogsById(id) {
  clearLogs();
  idInput.removeClass('bg-red-200');

  if (idInput.valid()) {
    if (idInput.val.length >= 8) {
      axios
        .get(`${url}logs?courseId=${select.val}&uvuId=${id}`)
        .then((response) => {
          if (response.status == 200 || response.status == 304) {
            displayLogs(response.data);
          } else {
            logId.text = `Error ${response.status}, please try again.`;
          }
        })
        .catch((error) => console.log(error));
    }
  } else if (idInput.val.length > 1) {
    idInput.addClass('bg-red-200');
    logReady();
  }
}

idInput.on('keyup', () => {
  displayLogsById(idInput.val);
});

// display logs
function displayLogs(data) {
  logDisplay.show();

  if (data.length < 1) {
    logId.text = `Logs not found for ${idInput.val}`;
  } else {
    logId.text = `Student Logs for ${data[0]['uvuId']}`;
  }

  data.forEach((log) => {
    logList.append(createLogListItem(log));
  });
  logReady();
}

// create collapsible log list item
function createLogListItem(log) {
  const listItem = $('<li>');
  listItem.html = `<small class="flex justify-between">${log.date}<svg class="w-5 h-5 mx-1.5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></small>
  <div id="log${log.id}" style="display:none;" class="mt-2 font-bold"><p>${log.text}</p></div>`;

  listItem.on('click', (event) => {
    $(`#log${log.id}`).toggle();
  });
  return listItem.get(0);
}

// remove logs displayed
function clearLogs() {
  logList.html = '';
  logId.text = '';
  logDisplay.hide();
}

// check if log is ready when user is typing in the textarea
newLogTxtArea.on('keyup', logReady);

// check if new log is ready to be sent
function logReady() {
  if (logId.text != '' && newLogTxtArea.val != '' && select.val != '') {
    newLogBtn.prop('disabled', false);
  } else {
    newLogBtn.prop('disabled', true);
  }
}

// Translate new log information into object
function createNewLogData() {
  let currDate = new Date();
  return {
    courseId: select.val,
    uvuId: idInput.val,
    date: `${
      currDate.getMonth() + 1
    }/${currDate.getDate()}/${currDate.getFullYear()} ${
      currDate.getHours() > 12 ? currDate.getHours() - 12 : currDate.getHours()
    }:${currDate.getMinutes()}:${currDate.getSeconds()} ${
      currDate.getHours() >= 12 ? 'PM' : 'AM'
    }`,
    text: newLogTxtArea.val,
    id: generateUniqueString(7),
  };
}

// Send new log to server
newLogBtn.on('click', (event) => {
  axios
    .post(url + 'logs', createNewLogData())
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});

// generate unique id for new log
function generateUniqueString(length) {
  var id = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (var i = 0; i < array.length; i++) {
    id += characters.charAt(array[i] % characters.length);
  }
  return id;
}
