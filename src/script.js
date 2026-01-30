var serverIP = window.location.hostname;
var apiPassword = localStorage.getItem("apiPassword") || "";
var ultimateInfo = {};
var toastTimeout = null;
function toast(msg, duration = 3000) {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    $("#toast").removeClass("show");
  }
  $("#toast").text(msg);
  $("#toast").addClass("show");
  toastTimeout = setTimeout(function () {
    $("#toast").removeClass("show");
  }, duration);
}

let wait = 0;

async function onlineCheck() {
  wait++;
  if (wait < 10) {
    $("#content").show();
    $("#offline").hide();
  } else if (wait >= 10) {
    $("#content").hide();
    $("#offline").show();
  }
  let [status_code, content] = await make_get_request(
    "http://" + serverIP + "/v1/info",
  );
  if (status_code) {
    wait = 0;
  }
}
setInterval(onlineCheck, 1000);

function insertAtCursor(myField, myValue) {
  //IE support
  if (document.selection) {
    myField.focus();
    const sel = document.selection.createRange();
    sel.text = myValue;
  }
  //MOZILLA and others
  else if (myField.selectionStart || myField.selectionStart == "0") {
    var startPos = myField.selectionStart;
    var endPos = myField.selectionEnd;
    myField.value =
      myField.value.substring(0, startPos) +
      myValue +
      myField.value.substring(endPos, myField.value.length);
  } else {
    myField.value += myValue;
  }
}

$(document).ready(async function () {
  $("#savepassword").prop(
    "checked",
    localStorage.getItem("savePassword") === "true",
  );

  $("ul[data-section=pages] li a").click(function (event) {
    window.location.hash = $(this).attr("id");
  });

  $("#basiceditor").val(
    localStorage.getItem("basiceditor") || $("#basiceditor").val(),
  );
  $("#basiceditor").on("input", function () {
    localStorage.setItem("basiceditor", $("#basiceditor").val());
  });

  $("#clearBASIC").click(function () {
    if (confirm("Are you sure you want to clear the BASIC editor?")) {
      localStorage.removeItem("basiceditor");
      window.location.reload();
    }
  });

  async function ensureLoggedIn() {
    // This also works with older firmware that do not support password protection (will get a 404 for /v1/info)
    let [status_code, content] = await make_get_request(
      "http://" + serverIP + "/v1/info",
    );
    if (status_code == 401 || status_code == 403) {
      $("#banner .title").html("&nbsp;");
      $("head>title").html("Login Required");
      $("#left-nav").css("visibility", "hidden");
      $("#password").val("");
      $(".page").hide();
      $("#login").show();
      $("#password").focus();
    } else {
      if (content) {
        ultimateInfo = content;
        let infoTable = $("<table></table>");
        for (const [key, value] of Object.entries(ultimateInfo)) {
          if (key === "errors") continue;
          let row = $("<tr></tr>");
          row.append($("<td></td>").text(key.replace(/_/g, " ")));
          row.append($("<td></td>").text(value));
          infoTable.append(row);
        }
        $("#infoTableContainer").empty().append(infoTable);
      }

      let product = ultimateInfo.product
        ? ultimateInfo.product
        : "Ultimate II/64";
      if (apiPassword != "") {
        $("#logoutmenuitem").show();
      } else {
        $("#logoutmenuitem").hide();
      }
      $("body").addClass(product.replace(/\s+/g, "-").toLowerCase());
      $("#banner .title, head>title").html(product + " HTTP Server");
      $("#left-nav").css("visibility", "visible");
      $(".page").hide();
      $("#welcome").show();

      if (product.includes("C64 Ulti")) {
        $(".commodore_only").show();
        $(".ultimate_only").hide();
      } else {
        $(".commodore_only").hide();
        $(".ultimate_only").show();
      }
    }
  }
  $("#loginbutton").click(async function (event) {
    apiPassword = $("#password").val();
    if ($("#savepassword").is(":checked")) {
      localStorage.setItem("apiPassword", apiPassword);
      localStorage.setItem("savePassword", "true");
    } else {
      localStorage.setItem("apiPassword", apiPassword);
      localStorage.setItem("savePassword", "false");
    }
    await ensureLoggedIn();
  });

  $("#password").on("keypress", async function (event) {
    if (event.which == 13) {
      await $("#loginbutton").click();
    }
  });

  $("#logout").click(async function (event) {
    apiPassword = "";
    localStorage.setItem("apiPassword", apiPassword);
    await ensureLoggedIn();
  });

  $("#doreset").click(function (event) {
    event.preventDefault(); // Prevents the default action of the anchor tag
    doReset();
  });

  async function doReset() {
    let params = {};
    let [status_code, content] = await make_put_request(
      "http://" + serverIP + "/v1/machine:reset",
      params,
    );
  }

  $("#doreboot").click(function (event) {
    event.preventDefault(); // Prevents the default action of the anchor tag
    doReboot();
  });

  async function doReboot() {
    let params = {};
    let [status_code, content] = await make_put_request(
      "http://" + serverIP + "/v1/machine:reboot",
      params,
    );
  }
  $("#dopause").click(function (event) {
    event.preventDefault(); // Prevents the default action of the anchor tag
    doPause();
  });
  async function doPause() {
    let params = {};
    let [status_code, content] = await make_put_request(
      "http://" + serverIP + "/v1/machine:pause",
      params,
    );
  }
  $("#doresume").click(function (event) {
    event.preventDefault(); // Prevents the default action of the anchor tag
    doResume();
  });
  async function doResume() {
    let params = {};
    let [status_code, content] = await make_put_request(
      "http://" + serverIP + "/v1/machine:resume",
      params,
    );
  }
  $("#dopoweroff").click(function (event) {
    event.preventDefault(); // Prevents the default action of the anchor tag
    doPowerOff();
  });
  async function doPowerOff() {
    if (
      !confirm(
        "Are you sure you want to power off the Ultimate 64?\nCAUTION: YOU WILL NOT BE ABLE TO POWER IT BACK ON REMOTELY WITHOUT PHYSICAL ACCESS TO THE UNIT!",
      )
    ) {
      return;
    }
    let params = {};
    let [status_code, content] = await make_put_request(
      "http://" + serverIP + "/v1/machine:poweroff",
      params,
    );
  }

  $("#domenubutton").click(function (event) {
    event.preventDefault(); // Prevents the default action of the anchor tag
    doMenuButton();
  });

  async function doMenuButton() {
    let params = {};
    let [status_code, content] = await make_put_request(
      "http://" + serverIP + "/v1/machine:menu_button",
      params,
    );
  }

  $("#showterminal").click(function (event) {
    event.preventDefault(); // Prevents the default action of the anchor tag
    $(".page").hide();
    $("#livemon").show(); // Shows the hidden div
  });

  $("#showwelcome").click(function (event) {
    event.preventDefault(); // Prevents the default action of the anchor tag
    $(".page").hide();
    $("#welcome").show();
  });

  $("#showsidplay").click(function (event) {
    event.preventDefault(); // Prevents the default action of the anchor tag
    $(".page").hide();
    $("#sidplay").show();
  });

  $("#submitForm").click(function (e) {
    e.preventDefault();
    submitSidPlayer();
  });

  $("#showrunner").click(function (event) {
    event.preventDefault(); // Prevents the default action of the anchor tag
    $(".page").hide();
    $("#runner").show();
  });

  $("#submitRunnerForm").click(function (e) {
    e.preventDefault();
    submitRunner();
  });

  $("#showtokenizer").click(function (event) {
    event.preventDefault(); // Prevents the default action of the anchor tag
    $(".page").hide();
    $("#tokenizer").show();
  });

  $("#showinfo").click(function (event) {
    populateSettings();
    event.preventDefault(); // Prevents the default action of the anchor tag
    $(".page").hide();
    $("#info").show();
  });
  async function populateGroupSettings(group) {
    let [status, settings] = await make_get_request("/v1/configs/" + group);

    if (status !== 200) {
      window.setTimeout(() => populateGroupSettings(group), 1000);
    }
    let settingsHeader = $("tr[data-group='" + group + "']");
    for (const key of Object.keys(settings[group])) {
      const value = settings[group][key];
      let settingRow = $("<tr></tr>")
        .attr("data-key", key)
        .addClass("tooltip")
        .addClass("needsData")
        .attr("data-group", group);
      let keyCol = $("<td></td>").text(key);
      let valueCol = $("<td></td>").text(value);

      settingRow.hover(async function () {
        const $this = $(this);
        if (!$this.hasClass("needsData")) {
          return;
        }

        let [status, settingDetails] = await make_get_request(
          "/v1/configs/" + group + "/" + key,
        );

        let sd = settingDetails[group][key];
        let tooltipText = "";
        if (typeof sd !== "object") {
          $(this).removeClass("needsData");
          $(this).removeClass("tooltip");
        }
        if (sd.default !== undefined) {
          tooltipText += "Default: " + sd.default;
        }

        delete sd.default;

        if (sd.min !== undefined && sd.max !== undefined) {
          tooltipText += "\nRange: " + sd.min + " to " + sd.max;
          delete sd.min;
          delete sd.max;
        } else if (sd.min !== undefined) {
          tooltipText += "\nMin: " + sd.min;
          delete sd.min;
        } else if (sd.max !== undefined) {
          tooltipText += "\nMax: " + sd.max;
          delete sd.max;
        }
        if (sd.presets) {
          tooltipText += "\nPresets:\n";
          for (const preset of sd.presets) {
            tooltipText += " - " + preset + "\n";
          }
          delete sd.presets;
        }

        delete sd.current;
        if (sd.values) {
          tooltipText += "\nValue(s):\n";
          for (const value of sd.values) {
            tooltipText += " - " + value + "\n";
          }
          delete sd.values;
        }

        $this.attr("title", tooltipText);
        $this.removeClass("needsData");
      });
      settingRow.append(keyCol);
      settingRow.append(valueCol);
      settingsHeader.after(settingRow);
    }
  }

  async function populateSettings() {
    let [status, groups] = await make_get_request("/v1/configs");
    if (status !== 200) {
      window.setTimeout(populateSettings, 1000);
      return;
    }
    let settingsTable = $("<table></table>");
    for (let group of groups.categories) {
      let groupHeader = $("<tr></tr>").attr("data-group", group);
      let groupCol = $("<td colSpan='2'></td>");
      groupCol.text(group).addClass("header");
      groupHeader.append(groupCol);
      settingsTable.append(groupHeader);
    }
    $("#settings").empty().append(settingsTable);
    for (let group of groups.categories) {
      await populateGroupSettings(group);
    }
  }

  async function submitSidPlayer() {
    let body = $("#file")[0].files[0];
    let params = {};
    let [status_code, content] = await make_post_request(
      "http://" + serverIP + "/v1/runners:sidplay",
      params,
      body,
    );

    if (status_code !== 200) {
      $("#sidmsg").show();
    } else {
      $("#sidmsg").hide();
    }
  }

  async function submitRunner() {
    let body = $("#runnerfile")[0].files[0];
    let filename = $("#runnerfile")[0].files[0].name;
    let parts = filename.split(".");
    let extension = parts.length > 1 ? parts[parts.length - 1] : "";
    extension = extension.toUpperCase();

    let params = {};

    if (extension === "PRG") {
      let [status_code, content] = await make_post_request(
        "http://" + serverIP + "/v1/runners:run_prg",
        params,
        body,
      );

      if (status_code !== 200) {
        $("#runmsg").show();
      } else {
        $("#runmsg").hide();
      }
    }

    if (extension === "CRT") {
      let [status_code, content] = await make_post_request(
        "http://" + serverIP + "/v1/runners:run_crt",
        params,
        body,
      );

      if (status_code !== 200) {
        $("#runmsg").show();
      } else {
        $("#runmsg").hide();
      }
    }
  }

  $("#submitBASIC").click(function (event) {
    event.preventDefault(); // Prevents the default action of the anchor tag
    parseBASIC();
  });

  $(document).keydown(function (e) {
    if (e.altKey && e.key === "u") {
      e.preventDefault();
      $("#submitBASIC").click();
    }
  });

  $("#submitBASICrun").click(function (event) {
    event.preventDefault(); // Prevents the default action of the anchor tag
    parseBASIC(true);
  });

  $(document).keydown(function (e) {
    if (e.altKey && e.key === "r") {
      e.preventDefault();
      $("#submitBASICrun").click();
    }
  });

  async function parseBASIC(start) {
    start = start || false;
    var textarea = $("#basiceditor").val();

    // Split into lines, remove blank lines, convert to lowercase, and join back
    var temp = textarea
      .split("\n")
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line.trim().length > 0)
      .join("\n");

    $("#basiceditor").val(temp);
    var lines = temp.split("\n");

    const tokenized_lines = [];
    let addr = 2049;

    // Process each line
    for (let x = 0; x < lines.length; x++) {
      const tokenizedLine = new TokenizedLine(lines[x].trim(), addr);
      addr += tokenizedLine.length();
      tokenized_lines.push(tokenizedLine);
    }

    let i = 1;
    while (i < tokenized_lines.length) {
      tokenized_lines[i - 1].next_addr = tokenized_lines[i].addr;
      i += 1;
    }

    tokenized_lines[i - 1].next_addr =
      tokenized_lines[i - 1].addr + tokenized_lines[i - 1].bytes.length + 5;

    var data = convertData(tokenized_lines);
    if (basic_error !== "") {
      $("#basicmsg").text(basic_error);
      $("#basicmsg").show();
    } else {
      $("#basicmsg").hide();

      let params = { address: "0801" };
      let [status_code, content] = await make_post_request(
        "http://" + serverIP + "/v1/machine:writemem",
        params,
        data,
      );

      let varptr = toHex16(tokenized_lines[i - 1].next_addr + 2);
      varptr = varptr.substring(2, 4) + varptr.substring(0, 2);

      params = { address: "002d", data: varptr };
      [status_code, content] = await make_put_request(
        "http://" + serverIP + "/v1/machine:writemem",
        params,
      );

      if (start) {
        params = { address: "0277", data: "0d52554e3a0d" };
        [status_code, content] = await make_put_request(
          "http://" + serverIP + "/v1/machine:writemem",
          params,
        );
        params = { address: "00c6", data: "06" };
        [status_code, content] = await make_put_request(
          "http://" + serverIP + "/v1/machine:writemem",
          params,
        );
        toast("BASIC program uploaded and started.");
      } else {
        toast("BASIC program uploaded.");
      }
    }

    basic_error = "";
  }

  function getAsciiValues(str) {
    var asciiValues = [];
    for (var i = 0; i < str.length; i++) {
      asciiValues.push(str.charCodeAt(i));
    }
    return asciiValues;
  }

  var basic_error = "";

  const TOKENS = [
    ["restore", 140],
    ["input#", 132],
    ["return", 142],
    ["verify", 149],
    ["print#", 152],
    ["right$", 201],
    ["input", 133],
    ["gosub", 141],
    ["print", 153],
    ["close", 160],
    ["left$", 200],
    ["next", 130],
    ["data", 131],
    ["read", 135],
    ["goto", 137],
    ["stop", 144],
    ["wait", 146],
    ["load", 147],
    ["save", 148],
    ["poke", 151],
    ["cont", 154],
    ["list", 155],
    ["open", 159],
    ["tab(", 163],
    ["spc(", 166],
    ["then", 167],
    ["step", 169],
    ["peek", 194],
    ["str$", 196],
    ["chr$", 199],
    ["mid$", 202],
    ["end", 128],
    ["for", 129],
    ["dim", 134],
    ["let", 136],
    ["run", 138],
    ["rem", 143],
    ["def", 150],
    ["clr", 156],
    ["cmd", 157],
    ["sys", 158],
    ["get", 161],
    ["new", 162],
    ["not", 168],
    ["and", 175],
    ["sgn", 180],
    ["int", 181],
    ["abs", 182],
    ["usr", 183],
    ["fre", 184],
    ["pos", 185],
    ["sqr", 186],
    ["rnd", 187],
    ["log", 188],
    ["exp", 189],
    ["cos", 190],
    ["sin", 191],
    ["tan", 192],
    ["atn", 193],
    ["len", 195],
    ["val", 197],
    ["asc", 198],
    ["if", 139],
    ["on", 145],
    ["to", 164],
    ["fn", 165],
    ["or", 176],
    ["go", 203],
    ["+", 170],
    ["-", 171],
    ["*", 172],
    ["/", 173],
    ["^", 174],
    [">", 177],
    ["=", 178],
    ["<", 179],
  ];

  const TOKENS_UPPERCASE = TOKENS.map((token) => [
    token[0].toUpperCase(),
    token[1],
  ]);

  const SPECIAL = [
    ["{rvs off}", 0x92],
    ["{rvs on}", 0x12],
    ["{up}", 0x91],
    ["{down}", 0x11],
    ["{left}", 0x9d],
    ["{rght}", 0x1d],
    ["{clr}", 0x93],
    ["{clear}", 0x93],
    ["{home}", 0x13],

    ["{blk}", 0x90],
    ["{wht}", 0x05],
    ["{red}", 0x1c],
    ["{cyn}", 0x9f],
    ["{pur}", 0x9c],
    ["{grn}", 0x1e],
    ["{blu}", 0x1f],
    ["{yel}", 0x9e],
    ["{org}", 0x81],
    ["{brn}", 0x95],
    ["{lred}", 0x96],
    ["{dgry}", 0x97],
    ["{mgry}", 0x98],
    ["{lgrn}", 0x99],
    ["{lblu}", 0x9a],
    ["{lgry}", 0x9b],
  ];

  function asciiToPetscii(o) {
    // Check if character code is less than or equal to '@' or is '[' or ']'
    if (
      o <= "@".charCodeAt(0) ||
      o === "[".charCodeAt(0) ||
      o === "]".charCodeAt(0)
    ) {
      return o;
    }
    // Check if character code is between 'a' and 'z'
    if (o >= "a".charCodeAt(0) && o <= "z".charCodeAt(0)) {
      return o - "a".charCodeAt(0) + 0x41;
    }
    // Check if character code is between 'A' and 'Z'
    if (o >= "A".charCodeAt(0) && o <= "Z".charCodeAt(0)) {
      return o - "A".charCodeAt(0) + 0x61 + 0x60;
    }

    basic_error = "Error -> ..." + o + " \nUnable to convert to PETSCII value.";
  }

  function scan(s, tokenize = true) {
    if (tokenize) {
      for (let i = 0; i < TOKENS.length; i++) {
        let [token, value] = TOKENS[i];
        if (s.startsWith(token)) {
          return [value, s.substring(token.length)];
        }
      }
    }
    if (s[0] === "{") {
      for (let i = 0; i < SPECIAL.length; i++) {
        let [token, value] = SPECIAL[i];
        if (s.startsWith(token)) {
          return [value, s.substring(token.length)];
        }
      }
      basic_error = "Error -> ..." + s + " \nInvalid code.";
    }
    return [asciiToPetscii(s.charCodeAt(0)), s.substring(1)];
  }

  function scanLineNumber(s) {
    s = s.trimStart();
    let acc = [];
    while (s && s[0].match(/\d/)) {
      acc.push(s[0]);
      s = s.substring(1);
    }
    return [parseInt(acc.join(""), 10), s.trimStart()];
  }

  function tokenize(s) {
    let [lineNumber, remainingString] = scanLineNumber(s);
    let bytes = [];
    let inQuotes = false;
    let inRemark = false;

    while (remainingString) {
      let [byte, newString] = scan(remainingString, !(inQuotes || inRemark));
      bytes.push(byte);
      remainingString = newString;

      if (byte === '"'.charCodeAt(0)) {
        inQuotes = !inQuotes;
      }
      if (byte === 143) {
        inRemark = true;
      }
    }

    return [lineNumber, bytes];
  }

  class TokenizedLine {
    constructor(s, addr) {
      let [lineNumber, bytes] = tokenize(s); // Ensure tokenize function is defined
      this.lineNumber = lineNumber;
      this.bytes = bytes;
      this.addr = addr;
      //this.nextAddr = null;
    }

    toString() {
      return `${this.lineNumber} @${this.addr}: ${this.bytes}`;
    }

    length() {
      return this.bytes.length + 5;
    }
  }

  function convertData(dataArray) {
    let result = [];

    dataArray.forEach((item) => {
      // Extract low and high bytes of the next address and line number
      let nextAddrLowByte = item.next_addr & 0xff;
      let nextAddrHighByte = (item.next_addr >> 8) & 0xff;
      let lineNumberLowByte = item.lineNumber & 0xff;
      let lineNumberHighByte = (item.lineNumber >> 8) & 0xff;

      // Append to the result
      result.push(
        nextAddrLowByte,
        nextAddrHighByte,
        lineNumberLowByte,
        lineNumberHighByte,
      );
      result.push(...item.bytes);
      result.push(0); // Terminator
    });
    result.push(0);
    result.push(0);

    return new Uint8Array(result);
  }

  $("#basiceditor").on("keypress", function (e) {
    var lines = $(this).val().split("\n");
    var cursorPosition = this.selectionStart;
    var currentLine = 0;
    var currentLineLength = 0;

    for (var i = 0; i < lines.length; i++) {
      currentLineLength += lines[i].length + 1; // +1 for the newline character
      if (cursorPosition <= currentLineLength) {
        currentLine = i;
        break;
      }
    }

    if (lines[currentLine].length >= 160 && e.which !== 8 && e.which !== 13) {
      e.preventDefault();
    }
  });

  function createTable() {
    let $table = $('<table border="0"></table>');

    // Calculate the number of rows needed for 10 columns
    let numRows = Math.ceil(SPECIAL.length / 10);

    for (let row = 0; row < numRows; row++) {
      let $row = $("<tr></tr>");
      for (let col = 0; col < 10; col++) {
        let cellIndex = row * 10 + col;
        if (cellIndex < SPECIAL.length) {
          let [symbol, code] = SPECIAL[cellIndex];
          $row.append(
            `<td><button class="insertSymbol">${symbol}</button></td>`,
          );
        } else {
          $row.append("<td></td>"); // Empty cell if no more data
        }
      }
      $table.append($row);
    }

    return $table;
  }

  $("#tableContainer").append(createTable());

  $(".insertSymbol").click(function () {
    var symbol = $(this).text();
    insertAtCursor(document.getElementById("basiceditor"), symbol);
  });

  $(".body").terminal(
    {
      help: async function () {
        this.echo("Available commands (with examples):");
        this.echo(" m - memory view ( m c000 c100 )");
        this.echo(" h - hunt memory ( h c000 c100 4a 30 00 )");
        this.echo(" f - fill memory ( f c000 c100 00 )");
        this.echo(" d - disassemble ( d c000 c100 )");
      },
      m: async function (address) {
        hex_num = address;
        if (isHexadecimal(hex_num)) {
          for (let i = 0; i < 16; i++) {
            let params = { address: hex_num, length: "16" };
            let [status_code, content] = await make_binary_get_request(
              "http://" + serverIP + "/v1/machine:readmem",
              params,
            );

            if (status_code === 200) {
              let [hex_content, ascii_content] =
                format_bytes_as_hex_and_ascii(content);
              this.echo(`${hex_num}: ${hex_content} | ${ascii_content}`);
            } else {
              this.echo("Failed to read memory or invalid response length");
            }
            hex_num = hex_increment(hex_num, 16);
          }
        } else {
          this.echo(
            "Invalid hexadecimal number. Please enter a 16-bit hexadecimal number.",
          );
        }
      },

      h: async function (start, end, ...hunt) {
        if (isHexadecimal(start) && isHexadecimal(end)) {
          let result = areAllValuesInRange(hunt);
          let startInt = hexToInt(start);
          let endInt = hexToInt(end);

          if (result == true) {
            let params = { address: "0", length: "65535" };
            let [status_code, content] = await make_binary_get_request(
              "http://" + serverIP + "/v1/machine:readmem",
              params,
            );

            if (status_code === 200) {
              hunt = hunt.map((hex) => parseInt(hex, 16));
              let indices = findConsecutiveValues(
                content,
                hunt,
                startInt,
                endInt,
              );
              for (let x = 0; x < indices.length; x++)
                this.echo(`${toHex16(indices[x])}`);
            } else {
              this.echo("Failed to read memory or invalid response length");
            }
          } else {
            this.echo("Invalid values.");
          }
        } else {
          this.echo("Usage: h <start addr> <end addr> <xx xx ...>");
        }
      },
      f: async function (start, end, byte) {
        if (isHexadecimal(start) && isHexadecimal(end)) {
          let startInt = hexToInt(start);
          let endInt = hexToInt(end);
          let hbyte = hexToInt(byte);
          let size = endInt - startInt + 1;

          let body = new Uint8Array(size);
          body.fill(hbyte);

          let params = { address: start };
          let [status_code, content] = await make_post_request(
            "http://" + serverIP + "/v1/machine:writemem",
            params,
            body,
          );

          if (status_code !== 200) {
            this.echo("Failed to update memory");
          }
        } else {
          this.echo("Usage: f <start addr> <end addr> <xx>");
        }
      },
      d: async function (start, end) {
        if (isHexadecimal(start) && isHexadecimal(end)) {
          let size = hexToInt(end) - hexToInt(start);

          let params = { address: start, length: size };
          let [status_code, content] = await make_binary_get_request(
            "http://" + serverIP + "/v1/machine:readmem",
            params,
          );

          if (status_code === 200) {
            let result = disassembler(hexToInt(start), content);
            this.echo(result);
          }
        } else {
          this.echo("Usage: d <start addr> <end addr>");
        }
      },
    },
    {
      checkArity: false,
      greetings: "Ultimate 64 / II+ Remote Monitor\nhelp = list of commands\n",
    },
  );

  // Kick off login/welcome screen as needed
  await ensureLoggedIn();
  if (window.location.hash) {
    let page = window.location.hash.substring(1);
    $("#" + page).trigger("click");
  }
});

function isHexadecimal(str) {
  hexval = false;
  regexp = /^[0-9a-fA-F]+$/;

  if (regexp.test(str)) return true;
  else return false;
}

function toHex16(num) {
  return num.toString(16).padStart(4, "0").toUpperCase();
}

function toHex8(num) {
  return num.toString(16).padStart(2, "0").toUpperCase();
}

function hexToInt(hexString) {
  return parseInt(hexString, 16);
}

function areAllValuesInRange(hexArray) {
  for (let hex of hexArray) {
    let value = parseInt(hex, 16); // Convert hex to decimal
    if (value < 0 || value > 255) {
      return false; // Value is out of range
    }
  }
  return true; // All values are in range
}

function hex_increment(hex_str, increment = 8) {
  return (parseInt(hex_str, 16) + increment).toString(16).padStart(4, "0");
}

function format_bytes_as_hex_and_ascii(byteData) {
  const hexContent = [];
  const asciiContent = [];

  for (const byte of byteData) {
    hexContent.push(byte.toString(16).padStart(2, "0"));

    // Printable ASCII characters are in the range 32 to 126
    if (byte >= 32 && byte <= 126) {
      asciiContent.push(String.fromCharCode(byte));
    } else {
      asciiContent.push(".");
    }
  }

  return [hexContent.join(" "), asciiContent.join("")];
}

function findConsecutiveValues(byteArray, valuesToFind, startIndex, endIndex) {
  const indices = [];
  const sequenceLength = valuesToFind.length;

  // Ensure start and end indices are within the array bounds
  startIndex = Math.max(startIndex, 0);
  endIndex = Math.min(endIndex, byteArray.length - sequenceLength);

  for (let i = startIndex; i <= endIndex; i++) {
    let match = true;
    for (let j = 0; j < sequenceLength; j++) {
      if (byteArray[i + j] !== valuesToFind[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      indices.push(i);
    }
  }

  return indices;
}

$.ajaxTransport("+binary", function (options, originalOptions, jqXHR) {
  // check for conditions and support for blob / arraybuffer response type
  if (
    window.FormData &&
    ((options.dataType && options.dataType == "binary") ||
      (options.data &&
        ((window.ArrayBuffer && options.data instanceof ArrayBuffer) ||
          (window.Blob && options.data instanceof Blob))))
  ) {
    return {
      // create new XMLHttpRequest
      send: function (headers, callback) {
        // setup all variables
        var xhr = new XMLHttpRequest(),
          url = options.url,
          type = options.type,
          async = options.async || true,
          // blob or arraybuffer. Default is blob
          dataType = options.responseType || "blob",
          data = options.data || null,
          username = options.username || null,
          password = options.password || null;

        xhr.addEventListener("load", function () {
          var data = {};
          data[options.dataType] = xhr.response;
          // make callback and send data
          callback(
            xhr.status,
            xhr.statusText,
            data,
            xhr.getAllResponseHeaders(),
          );
        });

        xhr.open(type, url, async, username, password);

        // setup custom headers
        for (var i in headers) {
          xhr.setRequestHeader(i, headers[i]);
        }

        xhr.responseType = dataType;
        xhr.send(data);
      },
      abort: function () {
        jqXHR.abort();
      },
    };
  }
});

async function make_binary_get_request(url, params) {
  const queryString = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
  const fullUrl = `${url}?${queryString}`;

  try {
    const response = await $.ajax({
      url: fullUrl,
      method: "GET",
      dataType: "binary",
      responseType: "arraybuffer",
      processData: false,
      headers: { "X-Password": apiPassword },
    });

    var data = new Uint8Array(response);

    return [200, data];
  } catch (error) {
    console.error("Error fetching data:", error);
    console.log("Error details:", {
      textStatus: error.statusText,
      status: error.status,
      responseText: error.responseText,
    });

    const statusCode = error && error.status ? error.status : 500;
    return [statusCode, new Uint8Array()];
  }
}

async function make_get_request(url, params) {
  params = params || {};
  const queryString = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
  const fullUrl = `${url}?${queryString}`;

  //console.log("Requesting URL:", fullUrl);

  try {
    const response = await $.ajax({
      url: fullUrl,
      method: "GET",
      processData: false,
      headers: { "X-Password": apiPassword },
    });
    return [200, response];
  } catch (error) {
    console.error("Error fetching data:", error);
    console.log("Error details:", {
      textStatus: error.statusText,
      status: error.status,
      responseText: error.responseText,
    });
    return [error.status, error.responseText];
  }
}

async function make_post_request(url, params, body) {
  const queryString = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
  const fullUrl = `${url}?${queryString}`;

  try {
    const response = await $.ajax({
      url: fullUrl,
      method: "POST",
      contentType: "application/octet-stream",
      data: body,
      processData: false,
      headers: { "X-Password": apiPassword },
    });

    return [200, response];
  } catch (error) {
    console.error("Error fetching data:", error);
    console.log("Error details:", {
      textStatus: error.statusText,
      status: error.status,
      responseText: error.responseText,
    });
    return [error.status, error.responseText];
    //const statusCode = error && error.status ? error.status : 500;
    //return [statusCode, response];
  }
}

async function make_put_request(url, params) {
  const queryString = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
  const fullUrl = `${url}?${queryString}`;

  try {
    const response = await $.ajax({
      url: fullUrl,
      method: "PUT",
      contentType: "application/octet-stream",
      processData: false,
      headers: { "X-Password": apiPassword },
    });

    return [200, response];
  } catch (error) {
    console.error("Error fetching data:", error);
    console.log("Error details:", {
      textStatus: error.statusText,
      status: error.status,
      responseText: error.responseText,
    });
    return [error.status, error.responseText];
    //const statusCode = error && error.status ? error.status : 500;
    //return [statusCode, response];
  }
}

const opcodes = {
  "00": { code: "BRK", len: 0, addr: 0 },
  "01": { code: "ORA", len: 1, addr: 11 },
  "05": { code: "ORA", len: 1, addr: 3 },
  "06": { code: "ASL", len: 1, addr: 3 },
  "08": { code: "PHP", len: 0, addr: 0 },
  "09": { code: "ORA", len: 1, addr: 2 },
  "0a": { code: "ASL", len: 0, addr: 1 },
  "0d": { code: "ORA", len: 2, addr: 7 },
  "0e": { code: "ASL", len: 2, addr: 7 },
  10: { code: "BPL", len: 1, addr: 6 },
  11: { code: "ORA", len: 1, addr: 12 },
  15: { code: "ORA", len: 1, addr: 4 },
  16: { code: "ASL", len: 1, addr: 4 },
  18: { code: "CLC", len: 0, addr: 0 },
  19: { code: "ORA", len: 2, addr: 9 },
  "1d": { code: "ORA", len: 2, addr: 8 },
  "1e": { code: "ASL", len: 2, addr: 8 },
  20: { code: "JSR", len: 2, addr: 7 },
  21: { code: "AND", len: 1, addr: 11 },
  24: { code: "BIT", len: 1, addr: 3 },
  25: { code: "AND", len: 1, addr: 3 },
  26: { code: "ROL", len: 1, addr: 3 },
  28: { code: "PLP", len: 0, addr: 0 },
  29: { code: "AND", len: 1, addr: 2 },
  "2a": { code: "ROL", len: 0, addr: 1 },
  "2c": { code: "BIT", len: 2, addr: 7 },
  "2d": { code: "AND", len: 2, addr: 7 },
  "2e": { code: "ROL", len: 2, addr: 7 },
  30: { code: "BMI", len: 1, addr: 6 },
  31: { code: "AND", len: 1, addr: 12 },
  35: { code: "AND", len: 1, addr: 4 },
  36: { code: "ROL", len: 1, addr: 4 },
  38: { code: "SEC", len: 0, addr: 0 },
  39: { code: "AND", len: 2, addr: 9 },
  "3d": { code: "AND", len: 2, addr: 8 },
  "3e": { code: "ROL", len: 2, addr: 8 },
  40: { code: "RTI", len: 0, addr: 0 },
  41: { code: "EOR", len: 1, addr: 11 },
  45: { code: "EOR", len: 1, addr: 3 },
  46: { code: "LSR", len: 1, addr: 3 },
  48: { code: "PHA", len: 0, addr: 0 },
  49: { code: "EOR", len: 1, addr: 2 },
  "4a": { code: "LSR", len: 0, addr: 1 },
  "4c": { code: "JMP", len: 2, addr: 7 },
  "4d": { code: "EOR", len: 2, addr: 7 },
  "4e": { code: "LSR", len: 2, addr: 7 },
  50: { code: "BVC", len: 1, addr: 6 },
  51: { code: "EOR", len: 1, addr: 12 },
  54: { code: "EOR", len: 1, addr: 4 },
  55: { code: "LSR", len: 1, addr: 4 },
  58: { code: "CLI", len: 0, addr: 0 },
  59: { code: "EOR", len: 2, addr: 9 },
  "5d": { code: "EOR", len: 2, addr: 8 },
  "5e": { code: "LSR", len: 2, addr: 8 },
  60: { code: "RTS", len: 0, addr: 0 },
  61: { code: "ADC", len: 1, addr: 11 },
  65: { code: "ADC", len: 1, addr: 3 },
  66: { code: "ROR", len: 1, addr: 3 },
  68: { code: "PLA", len: 0, addr: 0 },
  69: { code: "ADC", len: 1, addr: 2 },
  "6a": { code: "ROR", len: 0, addr: 1 },
  "6c": { code: "JMP", len: 2, addr: 10 },
  "6d": { code: "ADC", len: 2, addr: 7 },
  "6e": { code: "ROR", len: 2, addr: 7 },
  70: { code: "BVS", len: 1, addr: 6 },
  71: { code: "ADC", len: 1, addr: 12 },
  75: { code: "ADC", len: 1, addr: 4 },
  76: { code: "ROR", len: 1, addr: 4 },
  78: { code: "SEI", len: 0, addr: 0 },
  79: { code: "ADC", len: 2, addr: 9 },
  "7d": { code: "ADC", len: 2, addr: 8 },
  "7e": { code: "ROR", len: 2, addr: 8 },
  81: { code: "STA", len: 1, addr: 11 },
  84: { code: "STY", len: 1, addr: 3 },
  85: { code: "STA", len: 1, addr: 3 },
  86: { code: "STX", len: 1, addr: 3 },
  88: { code: "DEY", len: 0, addr: 0 },
  "8a": { code: "TXA", len: 0, addr: 0 },
  "8c": { code: "STY", len: 2, addr: 7 },
  "8d": { code: "STA", len: 2, addr: 7 },
  "8e": { code: "STX", len: 2, addr: 7 },
  90: { code: "BCC", len: 1, addr: 6 },
  91: { code: "STA", len: 1, addr: 12 },
  94: { code: "STY", len: 1, addr: 4 },
  95: { code: "STA", len: 1, addr: 4 },
  96: { code: "STX", len: 1, addr: 5 },
  98: { code: "TYA", len: 0, addr: 0 },
  99: { code: "STA", len: 2, addr: 9 },
  "9a": { code: "TXS", len: 0, addr: 0 },
  "9d": { code: "STA", len: 2, addr: 8 },
  a0: { code: "LDY", len: 1, addr: 2 },
  a1: { code: "LDA", len: 1, addr: 11 },
  a2: { code: "LDX", len: 1, addr: 2 },
  a4: { code: "LDY", len: 1, addr: 3 },
  a5: { code: "LDA", len: 1, addr: 3 },
  a6: { code: "LDX", len: 1, addr: 3 },
  a8: { code: "TAY", len: 0, addr: 0 },
  a9: { code: "LDA", len: 1, addr: 2 },
  aa: { code: "TAX", len: 0, addr: 0 },
  ac: { code: "LDY", len: 2, addr: 7 },
  ad: { code: "LDA", len: 2, addr: 7 },
  ae: { code: "LDX", len: 2, addr: 7 },
  b0: { code: "BCS", len: 1, addr: 6 },
  b1: { code: "LDA", len: 1, addr: 12 },
  b4: { code: "LDY", len: 1, addr: 4 },
  b5: { code: "LDA", len: 1, addr: 4 },
  b6: { code: "LDX", len: 1, addr: 5 },
  b8: { code: "CLV", len: 0, addr: 0 },
  b9: { code: "LDA", len: 2, addr: 9 },
  ba: { code: "TSX", len: 0, addr: 0 },
  bc: { code: "LDY", len: 2, addr: 8 },
  bd: { code: "LDA", len: 2, addr: 8 },
  be: { code: "LDX", len: 2, addr: 9 },
  c0: { code: "CPY", len: 1, addr: 2 },
  c1: { code: "CMP", len: 1, addr: 11 },
  c4: { code: "CPY", len: 1, addr: 3 },
  c5: { code: "CMP", len: 1, addr: 3 },
  c6: { code: "DEC", len: 1, addr: 3 },
  c8: { code: "INY", len: 0, addr: 0 },
  c9: { code: "CMP", len: 1, addr: 2 },
  ca: { code: "DEX", len: 0, addr: 0 },
  cc: { code: "CPY", len: 2, addr: 7 },
  cd: { code: "CMP", len: 2, addr: 7 },
  ce: { code: "DEC", len: 2, addr: 7 },
  d0: { code: "BNE", len: 1, addr: 6 },
  d1: { code: "CMP", len: 1, addr: 12 },
  d5: { code: "CMP", len: 1, addr: 4 },
  d6: { code: "DEC", len: 1, addr: 4 },
  d8: { code: "CLD", len: 0, addr: 0 },
  d9: { code: "CMP", len: 2, addr: 9 },
  dd: { code: "CMP", len: 2, addr: 8 },
  de: { code: "DEC", len: 2, addr: 8 },
  e0: { code: "CPX", len: 1, addr: 2 },
  e1: { code: "SBC", len: 1, addr: 11 },
  e4: { code: "CPX", len: 1, addr: 3 },
  e5: { code: "SBC", len: 1, addr: 3 },
  e6: { code: "INC", len: 1, addr: 3 },
  e8: { code: "INX", len: 0, addr: 0 },
  e9: { code: "SBC", len: 1, addr: 2 },
  ea: { code: "NOP", len: 0, addr: 0 },
  ec: { code: "CPX", len: 2, addr: 7 },
  ed: { code: "SBC", len: 2, addr: 7 },
  ee: { code: "INC", len: 2, addr: 7 },
  f0: { code: "BEQ", len: 1, addr: 6 },
  f1: { code: "SBC", len: 1, addr: 12 },
  f5: { code: "SBC", len: 1, addr: 4 },
  f6: { code: "INC", len: 1, addr: 4 },
  f8: { code: "SED", len: 0, addr: 0 },
  f9: { code: "SBC", len: 2, addr: 9 },
  fd: { code: "SBC", len: 2, addr: 8 },
  fe: { code: "INC", len: 2, addr: 8 },
};

function disassembler(startInt, byteArray) {
  var result = "";
  var instruction = "";
  var operand = "";

  var address;
  var instructionBytes;
  var syntax;

  var startingAddr = 0;

  hexString = Array.from(byteArray, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  for (pc = 0; pc < hexString.length; pc += 2) {
    operand = "";
    address = "";
    instructionBytes = "";
    syntax = "";

    address = (pc / 2).toString(16);
    startingAddr = pc;

    if (!opcodes.hasOwnProperty(hexString.substring(pc, pc + 2))) {
      instruction = { code: "???", len: 0, addr: 0 };
    } else {
      instruction = opcodes[hexString.substring(pc, pc + 2)];
    }

    //Retrieve operands (if there are any); Note: 6502 is little-endian
    if (instruction.len > 0) {
      for (i = 0; i < instruction.len; i++) {
        pc += 2;
        operand = hexString.substring(pc, pc + 2) + operand;
      }
    } else {
      operand = hexString.substring(pc, pc + 2);
    }

    syntax += instruction.code;

    switch (instruction.addr) {
      case 0: //If Implict
        break;
      case 1: //If Accumulator
        syntax += " A";
        break;
      case 2: //If Immediate
        syntax += " #$" + operand;
        break;
      case 3: //If Zero Page
        syntax += " $" + operand;
        break;
      case 4: //If Zero Page,X
        syntax += " $" + operand + ",X";
        break;
      case 5: //If Zero Page,Y
        syntax += " $" + operand + ",Y";
        break;
      case 6: //If Relative
        syntax += " $" + operand;
        break;
      case 7: //If Absolute
        syntax += " $" + operand;
        break;
      case 8: //If Absolute,X
        syntax += " $" + operand + ",X";
        break;
      case 9: //If Absolute,Y
        syntax += " $" + operand + ",Y";
        break;
      case 10: //If Indirect
        syntax += " ($" + operand + ")";
        break;
      case 11: //If Indexed Indirect
        syntax += " ($" + operand + ",X)";
        break;
      case 12: //If Indirect Indexed
        syntax += " ($" + operand + "),Y";
        break;
    }

    //Pad out address to 4 bytes
    while (address.length < 8) {
      address = "0" + address;
    }

    //Set hexstring from for full instruction
    instructionBytes = hexString.substring(startingAddr, pc + 2);

    const paddedString = instructionBytes.padEnd(6, " ");

    // Insert spaces after every second character
    const formattedBytes = paddedString.match(/.{1,2}/g).join(" ");

    result +=
      "\n" +
      toHex16(hexToInt(address) + startInt) +
      ":" +
      formattedBytes +
      "  " +
      syntax;
  }

  return result;
}
