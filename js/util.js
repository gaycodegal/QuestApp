/*
WIP IGNORE THIS FILE


textArea(cont) make a text area append to container cont
pre(cont) make a pre append to container cont

*/
function textArea(cont) {
  var ta = document.createElement("TEXTAREA");
  ta.classList.add("console-textarea");
  cont = cont || document.body;
  cont.appendChild(ta);
  return ta;
}

function pre(cont) {
  var ta = document.createElement("PRE");
  ta.classList.add("console-log");
  cont = cont || document.body;
  cont.appendChild(ta);
  return ta;
}
var utilDiv, consoleLog, txtar, txtar2, consoleLimit = 10;

function loadAFile() {

}

function saveAFile(fname) {
  if (fname && fname.length > 0)
    window.open("data:text/plain;base64;filename=" + fname + "," + btoa(txtar.value));
}

function util() {
  if (utilDiv) {
    utilDiv.style.display = "block";
  } else {
    var container = utilDiv = createDiv(false, "console-container", "");
    txtar = textArea(container);
    txtar2 = textArea(container);
    consoleLog = createDiv(container);
    consoleLog = pre(consoleLog);
    var saveBtn = createDiv(container, "console-button", "save");
    saveBtn.onclick = function () {
      saveAFile(prompt('Save Filename', "fname.txt"))
    };
    var loadBtn = createDiv(container, "console-button", "load");
    loadBtn.onclick = function () {
      loadAFile(prompt('Load Filename', "fname.txt"))
    };
    var evalBtn = createDiv(container, "console-button", "eval");
    evalBtn.onclick = function () {
      eval(txtar2.value)
    };
    var quitBtn = createDiv(container, "console-button", "quit");
    quitBtn.onclick = utilQuit;
  }
}

function utilQuit() {
  consoleButton.data.interrupt = false;
  utilDiv.style.display = "none";
}
consoleMessages = [];
 /*
(function(){
var TTTTTT = console.log; 
console.log = function (x) {
  TTTTTT(x);
 
  consoleMessages.push(x);
  if (consoleMessages.length > consoleLimit)
    consoleMessages = consoleMessages.slice(1, consoleMessages.length);
  if (consoleLog)
    consoleLog.textContent = consoleMessages.join("\n");
};
})();*/

function writeToUint(S, run, index) {
  u8 = [];
  var x = 0,
    len = 0;

  for (var i = 0; i < S.length; i++) {
    if (run >= 8) {
      u8[index++] = x;
      if (index > len) {
        u8.push(0);
        len++;
      }
      run = 0;
      x = 0;
    }

    x <<= 1;
    if (S[i] == "1")
      x++;
    run++;
  }
  u8[index] = x;
  var b64encoded = btoa(String.fromCharCode.apply(null, u8));
  return b64encoded; //new Uint8Array(u8);
}

function u82(b64encoded) {
  return new Uint8Array(atob(b64encoded).split("").map(function (c) {
    return c.charCodeAt(0);
  }));
}

function readXBits(u8, run, index, bits) {
  var len = u8.length;
  var x = 0;
  while (bits > 0 && index < len) {
    var y = u8[index++];
    if (bits >= 8 && run == 0) {
      x <<= 8;
      bits -= 8;
      x += y;
    } else {
      y >>= run;
      if (bits >= 8) {
        x <<= 8 - run;
        x += y;
        bits -= 8 - run;
      } else {
        x <<= bits;
        x += y >> (8 - bits);
        bits = 0;
      }
      run = 0;
    }
  }
  if (bits > 0) {
    x <<= bits;
  }
  return x;
}


function writeXBits(u8, run, index, x, bits) {
  var len = u8.length;
  while (bits > 0) {
    while (index >= len) {
      u8.push(0);
      len++;
    }
    if (bits >= 8 && run == 0) {

      ((256 >> 8) << 8) - (256 >> 8)
      index++;
    }
  }
  return x;
}