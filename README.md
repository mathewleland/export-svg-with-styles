# Turn your SVGs to PNGs

Turn your d3 charts (or whatever svg you want!) into exportable png images WITH their styling! This npm package has one function, `downloadSVG`, that takes a list of configurable options and downloads

## Install and use

`npm install --save export-svg-with-styles`

`import downloadSVG from "export-svg-with-styles"`

The `downloadSVG` function takes an options object that has optional values. You could potentially call it without arguments `downloadSVG()` and it will download the first SVG it finds in the DOM tree.

### Options object

`svg` Reference to the svg element. Default is `document.querySelector("svg")`

`width` ::number Pixels-wide of exported image. Default is `3200`

`height` ::number Pixels-high of exported image. Default is `2400`

`filename` ::string Name of the file you want. Default is `convertedsvg.png`

Remember when adjusting your sizing that if you need your element for printing, that standard printing dpi is 300 (most screens are 72). So make sure your dimensions are at least 3X as large as you need them to be.

### Example use

```
const options = {
  width: 1000,
  height: 1000,
  svg: document.getElementById("myChart"),
  filename: "Barchart.png"
  };

downloadSVG(options);
```

#### Credit

This function was adapted largely from [Nikita Roktyan's d3 bl.ock](http://bl.ocks.org/Rokotyan/0556f8facbaf344507cdc45dc3622177)
