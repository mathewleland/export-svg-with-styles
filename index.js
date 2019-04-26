var saveAs = require("file-saver");

// need to turn svg element into a string before we can append styles to it
function translateSVGToString(svgNode) {
  svgNode.setAttribute("xlink", "http://www.w3.org/1999/xlink");
  const cssStr = getStyles(svgNode);
  hookStyling(cssStr, svgNode);

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgNode);
  svgString = svgString.replace(/(\w+)?:?xlink=/g, "xmlns:xlink=");
  svgString = svgString.replace(/NS\d+:href/g, "xlink:href"); // Safari NS namespace fix

  return svgString;
}
function hookStyling(cssText, element) {
  // this should place text that looks like <style> div{color:red}</style> in front of svg
  const styleElement = document.createElement("style");
  styleElement.setAttribute("type", "text/css");
  styleElement.innerHTML = cssText;
  const refNode = element.hasChildNodes() ? element.children[0] : null;
  element.insertBefore(styleElement, refNode);
}

function getStyles(parentElement) {
  const selectorTextArr = [];
  // Add Parent element Id and Classes to the list
  selectorTextArr.push("#" + parentElement.id);
  for (let c = 0; c < parentElement.classList.length; c++)
    if (!contains("." + parentElement.classList[c], selectorTextArr))
      selectorTextArr.push("." + parentElement.classList[c]);
  // Add Children element Ids and Classes to the list
  const nodes = parentElement.getElementsByTagName("*");
  for (let i = 0; i < nodes.length; i++) {
    const id = nodes[i].id;
    if (!contains("#" + id, selectorTextArr)) selectorTextArr.push("#" + id);

    const classes = nodes[i].classList;
    for (let c = 0; c < classes.length; c++)
      if (!contains("." + classes[c], selectorTextArr))
        selectorTextArr.push("." + classes[c]);
  }

  // Extract CSS Rules
  let extractedCSSText = "";
  for (let i = 0; i < document.styleSheets.length; i++) {
    const s = document.styleSheets[i];

    try {
      if (!s.cssRules) continue;
    } catch (e) {
      if (e.name !== "SecurityError") throw e; // for Firefox
      continue;
    }

    const cssRules = s.cssRules;
    for (let r = 0; r < cssRules.length; r++) {
      if (contains(cssRules[r].selectorText, selectorTextArr))
        extractedCSSText += cssRules[r].cssText;
    }
  }

  return extractedCSSText;

  function contains(str, arr) {
    return arr.indexOf(str) === -1 ? false : true;
  }
}

function convertSVGtoImage(options) {
  const { svgString, width, height, callback } = options;
  const imgsrc =
    "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  const image = new Image();
  image.onload = function() {
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    canvas.toBlob(function(blob) {
      const filesize = Math.round(blob.length / 1024) + " KB";
      if (callback) callback(blob, filesize);
    });
  };

  image.src = imgsrc;
}

// EXPORTED FUNCTION
function downloadSVG(props) {
  props = props || {};
  const svg = props.svg || document.querySelector("svg");
  const height = props.height || 2400;
  const width = props.width || 3200; // generally want higher res for printing, but this can be adjusted
  const filename = props.filename || "convertedsvg.png";
  const svgString = translateSVGToString(svg);

  const options = {
    svgString,
    width,
    height,
    callback: save
  };
  convertSVGtoImage(options);

  // callback to send to our convertsvgtoimage function --
  // this can be adapted to any callback that you want with your datablob
  function save(dataBlob) {
    saveAs(dataBlob, filename);
  }
}

module.exports = downloadSVG;
