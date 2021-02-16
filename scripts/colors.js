// Timothy Arsenault

function getColor(hex) {
    if (!hex) {
        return '#FFFFFF'; //white
    }
    //convert to hsl
    let hsl = hexToHSL(hex);
    //call recursive check
    return checkColor(hsl);
}

function checkColor(hsl) {
    const bg_L = 0.013702083047289686;

    //get relative luminocity
    const text_L = getL(HSLToRGB(hsl));
    //check contrast
    const contrast = (Math.max(bg_L, text_L) + 0.05) / (Math.min(bg_L, text_L) + 0.05);
    if (contrast < 3.5) {
        //change color
        let vars = hsl.match(/(hsl\([\d.]+,\s*[\d.]+%,\s*)([\d.]+)(%\))$/i);
        if (vars.length != 1)
            return checkColor(vars[1] + (parseInt(vars[2]) + 1.0) + vars[3]);
        else {
            console.error('Could not parse HSL');
        }
    }
    else {
        //don't change color
        return hsl;
    }
}

function getL(rgb) {
    //parse rgb
    let arr = rgb.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    //get sRGB
    //set rgb
    var r = arr[1] / 255,
        g = arr[2] / 255,
        b = arr[3] / 255;
    if (r <= 0.03928)
        r = r / 12.92;
    else
        r = Math.pow(((r + 0.055) / 1.055), 2.4);
    if (g <= 0.03928)
        g = g / 12.92;
    else
        g = Math.pow(((g + 0.055) / 1.055), 2.4);
    if (b <= 0.03928)
        b = b / 12.92;
    else
        b = Math.pow(((b + 0.055) / 1.055), 2.4);
    //return luminosity
    return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
}

//ty Jon Kantner from css-tricks.com
function HSLToRGB(hsl) {
    let sep = hsl.indexOf(",") > -1 ? "," : " ";
    hsl = hsl.substr(4).split(")")[0].split(sep);

    let h = hsl[0],
        s = hsl[1].substr(0, hsl[1].length - 1) / 100,
        l = hsl[2].substr(0, hsl[2].length - 1) / 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return "rgb(" + r + "," + g + "," + b + ")";
}

//ty Jon Kantner from css-tricks.com
function RGBToHSL(rgb) {
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    rgb = rgb.substr(4).split(")")[0].split(sep);

    for (let R in rgb) {
        let r = rgb[R];
        if (r.indexOf("%") > -1)
            rgb[R] = Math.round(r.substr(0, r.length - 1) / 100 * 255);
    }

    // Make r, g, and b fractions of 1
    let r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255;

    // Find greatest and smallest channel values
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    // Calculate hue
    // No difference
    if (delta == 0)
        h = 0;
    // Red is max
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    // Green is max
    else if (cmax == g)
        h = (b - r) / delta + 2;
    // Blue is max
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    // Make negative hues positive behind 360°
    if (h < 0)
        h += 360;

    // Calculate lightness
    l = (cmax + cmin) / 2;

    // Calculate saturation
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    // Multiply l and s by 100
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return "hsl(" + h + "," + s + "%," + l + "%)";
}

//ty Jon Kantner from css-tricks.com
function hexToHSL(H) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return "hsl(" + h + "," + s + "%," + l + "%)";
}